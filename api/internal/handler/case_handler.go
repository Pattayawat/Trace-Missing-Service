package handler

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "trace-missing-api/api/internal/model"
    "trace-missing-api/api/internal/service"
)

type CaseHandler struct {
    caseService service.CaseService
}

func (h *CaseHandler) GetCase(c *gin.Context) {

    id := c.Param("id") 

    detail, err := h.caseService.GetCaseByID(id)
    if err != nil {

        if err.Error() == "CASE_NOT_FOUND" {
            c.JSON(http.StatusNotFound, gin.H{
                "success": false,
                "message": "ไม่พบข้อมูลเคสที่ค้นหา",
            })
            return
        }
        
        c.JSON(http.StatusInternalServerError, gin.H{
            "success": false,
            "message": "เกิดข้อผิดพลาดในการดึงข้อมูล",
            "error":   err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    detail,
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

func (h *CaseHandler) ListCases(c *gin.Context) {

	cases, err := h.caseService.ListCases()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "เกิดข้อผิดพลาดในการดึงข้อมูล",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    cases,
	})
}