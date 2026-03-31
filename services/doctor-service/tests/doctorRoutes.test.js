process.env.JWT_SECRET = "test-secret";

jest.mock("../src/models/Doctor", () => ({
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Doctor = require("../src/models/Doctor");

const makeToken = (role = "admin") =>
    jwt.sign({ userId: "user-1", role }, process.env.JWT_SECRET);

const buildFindChain = (result) => ({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result)
});

describe("Doctor service routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /health returns service health", async () => {
        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body.service).toBe("doctor-service");
    });

    test("POST /api/doctors requires authentication", async () => {
        const response = await request(app)
            .post("/api/doctors")
            .send({});

        expect(response.statusCode).toBe(401);
    });

    test("POST /api/doctors validates the request body", async () => {
        const response = await request(app)
            .post("/api/doctors")
            .set("Authorization", `Bearer ${makeToken("admin")}`)
            .send({
                fullName: "Dr Test",
                email: "wrong-email",
                phone: "123",
                licenseNumber: "A1",
                specialties: [],
                consultationFee: -5
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Validation failed");
    });

    test("POST /api/doctors creates a doctor for an authorized role", async () => {
        Doctor.create.mockResolvedValue({
            _id: "507f1f77bcf86cd799439011",
            fullName: "Dr. Test User"
        });

        const response = await request(app)
            .post("/api/doctors")
            .set("Authorization", `Bearer ${makeToken("doctor-manager")}`)
            .send({
                fullName: "Dr. Test User",
                email: "doctor@example.com",
                phone: "0771234567",
                licenseNumber: "SLMC-5000",
                specialties: ["Cardiology"],
                consultationFee: 4000
            });

        expect(response.statusCode).toBe(201);
        expect(Doctor.create).toHaveBeenCalled();
    });

    test("GET /api/doctors returns paginated doctors", async () => {
        Doctor.find.mockReturnValue(buildFindChain([
            { _id: "1", fullName: "Dr A" }
        ]));
        Doctor.countDocuments.mockResolvedValue(1);

        const response = await request(app)
            .get("/api/doctors?limit=5&page=1&sortBy=nameAsc");

        expect(response.statusCode).toBe(200);
        expect(response.body.meta.total).toBe(1);
    });

    test("POST /api/doctors/:id/availability/check supports service integration role", async () => {
        Doctor.findById.mockResolvedValue({
            _id: "507f1f77bcf86cd799439011",
            status: "active",
            isAvailable: true,
            availability: [
                {
                    dayOfWeek: "monday",
                    startTime: "09:00",
                    endTime: "12:00",
                    mode: "both"
                }
            ]
        });

        const response = await request(app)
            .post("/api/doctors/507f1f77bcf86cd799439011/availability/check")
            .set("Authorization", `Bearer ${makeToken("service")}`)
            .send({
                dayOfWeek: "monday",
                startTime: "10:00",
                endTime: "11:00",
                mode: "online"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.data.canAcceptAppointment).toBe(true);
    });
});
