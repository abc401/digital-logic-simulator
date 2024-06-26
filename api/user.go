package api

import (
	"fmt"
	"net/http"
	"net/mail"
	"os"

	"github.com/abc401/digital-logic-simulator/api/auth"
	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/db"
	"github.com/abc401/digital-logic-simulator/models"
	"github.com/gin-gonic/gin"
)

type ApiUser struct {
	ID    uint
	UName string
	Email string
}

func ApiUserFromModel(userModel *models.User) ApiUser {
	return ApiUser{
		ID:    userModel.ID,
		UName: userModel.UName,
		Email: userModel.Email,
	}
}

func validatePassword(password string) bool {
	if len(password) < 8 {
		return false
	}
	return true
}

func GenToken(ctx *gin.Context) {
	type Params struct {
		Email    string
		Password string
	}

	var params Params
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var con = db.GetGormDBCon()
	var user = db.GetUser(con, params.Email)

	if user == nil || user.VerifyPassword(params.Password) != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credentials",
			"email": params.Email,
		})
	}
	tokenString, err := auth.GenerateJWT(user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		ctx.Abort()
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"token": tokenString})
}

func SignUp(ctx *gin.Context) {
	type Params struct {
		UserName string `binding:"required"`
		Email    string `binding:"required"`
		Password string `binding:"required"`
	}
	var params Params
	if !helpers.BindParams(&params, ctx) {
		return
	}

	if !validatePassword(params.Password) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Password should be at least 8 characters long",
		})
		ctx.Abort()
		return
	}
	var email, err = mail.ParseAddress(params.Email)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		fmt.Fprintf(os.Stderr, "err: %s", err.Error())
		ctx.Abort()
		return
	}
	fmt.Printf("mail: %s", helpers.SPrettyPrint(email))
	var address = email.Address

	var con = db.GetGormDBCon()
	if db.GetUser(con, address) == nil {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "Provided email has already been used",
			"email": address,
		})
		ctx.Abort()
		return
	}
	var user = &models.User{
		UName: params.UserName,
		Email: address,
	}

	if err = user.SetPassword(params.Password); err != nil {
		fmt.Fprintf(os.Stderr, "[Error] %s", err.Error())
	}

	con.Create(user)

	ctx.JSON(http.StatusCreated, gin.H{"user": ApiUserFromModel(user)})
}
