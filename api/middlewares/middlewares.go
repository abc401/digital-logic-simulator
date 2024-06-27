package middlewares

import (
	"fmt"
	"io"
	"net/http"

	"github.com/abc401/digital-logic-simulator/api/auth"
	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func CorsMiddleWare(ctx *gin.Context) {
	ctx.Header("Access-Control-Allow-Origin", "*")
	ctx.Next()
}

func PrintReqBody(ctx *gin.Context) {
	var body map[string]interface{}

	if err := ctx.ShouldBindBodyWith(&body, binding.JSON); err != nil && err != io.EOF {

		fmt.Println("Could not read request body: ", err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Could not read request body",
		})
		panic("")
	}

	fmt.Println("Request Body: ", helpers.SPrettyPrint(body))

	ctx.Next()
}

func Auth(context *gin.Context) {
	tokenString := context.GetHeader("Authorization")
	if tokenString == "" {
		context.JSON(401, gin.H{"error": "request does not contain an access token"})
		context.Abort()
		return
	}
	claims, err := auth.ValidateToken(tokenString)
	if err != nil {
		context.JSON(401, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	context.Set("email", claims.Email)
	context.Set("uid", claims.UID)
	context.Set("uname", claims.Username)
	context.Next()

}
