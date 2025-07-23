/**
 * Enhanced API Response class with metadata
 */
class ApiResponse {
    constructor(statusCode, data, message = "Success", metadata = {}) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.timestamp = new Date().toISOString();
        this.metadata = {
            version: "2.0.0",
            requestId: metadata.requestId || this.generateRequestId(),
            ...metadata
        };
    }

    generateRequestId() {
        return (
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
        );
    }

    // Factory methods for common responses
    static success(data = null, message = "Operation successful") {
        return new ApiResponse(200, data, message);
    }

    static created(data = null, message = "Resource created successfully") {
        return new ApiResponse(201, data, message);
    }

    static accepted(data = null, message = "Request accepted") {
        return new ApiResponse(202, data, message);
    }

    static noContent(message = "No content") {
        return new ApiResponse(204, null, message);
    }

    // Paginated response
    static paginated(
        data,
        pagination,
        message = "Data retrieved successfully"
    ) {
        const response = new ApiResponse(200, data, message);
        response.pagination = {
            currentPage: pagination.page || 1,
            totalPages: pagination.totalPages || 1,
            totalItems: pagination.totalDocs || 0,
            itemsPerPage: pagination.limit || 10,
            hasNextPage: pagination.hasNextPage || false,
            hasPrevPage: pagination.hasPrevPage || false
        };
        return response;
    }

    // Response with performance metrics
    static withMetrics(data, message, startTime) {
        const responseTime = Date.now() - startTime;
        const response = new ApiResponse(200, data, message);
        response.metadata.performance = {
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        };
        return response;
    }
}

export default ApiResponse;
