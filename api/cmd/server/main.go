package main

import (
	"context"
	"database/sql"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"trace-missing-api/api/internal/handler"
	"trace-missing-api/api/internal/service"
)

var ginLambda *ginadapter.GinLambda

func init() {

	connStr := "host=trace-missing-db.c0szwgbu1awj.us-east-1.rds.amazonaws.com port=5432 user=postgres password=MySecretPass123 dbname=missing_person_db sslmode=require"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("เกิดข้อผิดพลาดในการเปิดฐานข้อมูล: %v", err)
	}

	caseSvc := service.NewCaseService(db)
	caseHdl := handler.NewCaseHandler(caseSvc)

	router := gin.Default()
	router.POST("/v1/missing-reports", caseHdl.CreateReport)
	router.GET("/v1/missing-reports", caseHdl.ListCases)
	router.GET("/v1/missing-reports/:id", caseHdl.GetCase)

	ginLambda = ginadapter.New(router)
}


func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}