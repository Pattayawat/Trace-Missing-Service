package main

import (
	"github.com/gin-gonic/gin"

	"example/trace-missing-api/internal/handler"
	"example/trace-missing-api/internal/service"
)

func main() {

	caseSvc := service.NewCaseService()

	caseHdl := handler.NewCaseHandler(caseSvc)

	router := gin.Default()
	router.POST("/v1/missing-reports", caseHdl.CreateReport)
    router.GET("/v1/missing-reports", caseHdl.ListCases)
    router.GET("/v1/missing-reports/:id", caseHdl.GetCase)

	router.Run(":8080")
}