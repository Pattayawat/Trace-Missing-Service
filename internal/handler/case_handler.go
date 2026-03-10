package handler

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "example/trace-missing-api/internal/model"
    "example/trace-missing-api/internal/service"
)

type CaseHandler struct {
    caseService service.CaseService
}

func (h *CaseHandler) ListCases(c *gin.Context) {

    cases := []gin.H{
        {
            "missing_id": "MID-2026-001",
            "incident_id": "INC-2026-001",
            "status": "OPEN",
        },
        {
            "missing_id": "MID-2026-002",
            "incident_id": "INC-2026-002",
            "status": "OPEN",
        },
    }

    c.JSON(200, cases)
}

func (h *CaseHandler) GetCase(c *gin.Context) {

    id := c.Param("id")

    c.JSON(200, gin.H{
        "missing_id": id,
        "status": "OPEN",
    })
}

func NewCaseHandler(s service.CaseService) *CaseHandler {
    return &CaseHandler{caseService: s}
}

func (h *CaseHandler) CreateReport(c *gin.Context) {
    var req model.CreateCaseRequest

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "success": false,
            "code":    "VALIDATION_ERROR",
            "message": "Request validation failed",
            "errors":  []gin.H{{"field": "check request body", "message": err.Error()}},
        })
        return
    }

    result, err := h.caseService.CreateMissingReport(req)
    if err != nil {
        if err.Error() == "INCIDENT_NOT_FOUND" {
            c.JSON(http.StatusNotFound, gin.H{
                "success": false,
                "code":    "INCIDENT_NOT_FOUND",
                "message": "Incident ID " + req.IncidentID + " does not exist",
            })
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
        return
    }

    
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Missing person case created successfully",
        "data":    result,
    })
}