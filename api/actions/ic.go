package actions

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/abc401/digital-logic-simulator/api/helpers"
	"github.com/abc401/digital-logic-simulator/api/projectstate"
	"github.com/gin-gonic/gin"
)

type CreateICParams struct {
	SceneID projectstate.IDType
	ICName  string `binding:"required"`
}

func CreateICDo(ctx *gin.Context) {
	var params CreateICParams

	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()

	if params.SceneID == projectstate.DEFAULT_SCENE_ID {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "cannot reference scene 0 (Main scene) for custom circuit",
		})
	}

	if _, ok := project.ICs[params.SceneID]; ok {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "id is already taken",
			"id":    params.SceneID,
		})
	}

	for _, name := range project.ICs {
		if name == strings.ToLower(params.ICName) {
			ctx.JSON(http.StatusConflict, gin.H{
				"error": "proposed name is already taken",
				"name":  params.ICName,
			})
		}
	}

	project.Scenes[params.SceneID] = projectstate.NewSceneWithIO(params.SceneID, params.ICName)
	project.ICs[params.SceneID] = strings.ToLower(params.ICName)

	fmt.Printf("\n\nProject: %s\n\n", helpers.SPrettyPrint(project))
	ctx.JSON(http.StatusOK, gin.H{})
}

func CreateICUndo(ctx *gin.Context) {
	var params CreateICParams

	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()

	if params.SceneID == projectstate.DEFAULT_SCENE_ID {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "scene 0 (Main Scene) is not a custom ic",
		})
	}

	if _, ok := project.ICs[params.SceneID]; !ok {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "no custom ic with given id",
			"id":    params.SceneID,
		})
	}

	delete(project.Scenes, params.SceneID)
	delete(project.ICs, params.SceneID)

	fmt.Printf("\n\nProject: %s\n\n", helpers.SPrettyPrint(project))

	ctx.JSON(http.StatusOK, gin.H{})
}

func RenameICDo(ctx *gin.Context) {
	type Params struct {
		ID   projectstate.IDType
		From string
		To   string
	}
	var params Params
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()
	if _, ok := project.ICs[params.ID]; !ok {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "no ic with specified id",
			"id":    params.ID,
		})
		return
	}

	project.ICs[params.ID] = params.To
	project.Scenes[params.ID].Name = params.To
	ctx.JSON(http.StatusOK, gin.H{})

	fmt.Printf("\n\nProject: %s\n\n", helpers.SPrettyPrint(project))
}

func RenameICUndo(ctx *gin.Context) {
	type Params struct {
		ID   projectstate.IDType
		From string
		To   string
	}
	var params Params
	if !helpers.BindParams(&params, ctx) {
		return
	}

	var project = projectstate.GetProject()
	if _, ok := project.ICs[params.ID]; !ok {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "no ic with specified id",
			"id":    params.ID,
		})
		return
	}

	project.ICs[params.ID] = params.From
	project.Scenes[params.ID].Name = params.From
	ctx.JSON(http.StatusOK, gin.H{})

	fmt.Printf("\n\nProject: %s\n\n", helpers.SPrettyPrint(project))
}
