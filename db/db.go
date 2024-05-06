package db

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/abc401/digital-logic-simulator/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const Dsn = "root:1234@tcp(localhost:3306)/dls"

func GetDBCon() *gorm.DB {
	db, err := gorm.Open(mysql.Open(Dsn), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}
	return db

}

func AutoMigrate() {
	db := GetDBCon()
	err := db.AutoMigrate(&models.Article{})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Could not auto migrate: %s\n", err.Error())
		panic("")
	}
	fmt.Println("Successfully auto migrated")
}

func ConfigNextAndPrevious(tutorials []*models.Article) {
	for i := 0; i < len(tutorials); i++ {
		if i == 0 {
			tutorials[i].Previous = sql.NullString{}
		} else {
			tutorials[i].Previous = sql.NullString{
				String: tutorials[i-1].LinkTitle,
				Valid:  true,
			}
		}

		if i == len(tutorials)-1 {
			tutorials[i].Next = sql.NullString{}
		} else {
			tutorials[i].Next = sql.NullString{
				String: tutorials[i+1].LinkTitle,
				Valid:  true,
			}

		}
	}

}

func AddTutorials(tutorials []*models.Article) {
	db := GetDBCon()
	db.Exec("delete from articles")

	ConfigNextAndPrevious(tutorials)
	for i := 0; i < len(tutorials); i++ {
		var tutorial = tutorials[i]
		if tutorial.LinkTitle == "" {
			panic("Title of tutorial is not defined")
		}
		if tutorial.Content == "" {
			panic("Content of tutorial is not defined")
		}
		db.Create(tutorial)
	}
}

func AddTutorial(tutorial *models.Article) {
	if tutorial.LinkTitle == "" {
		panic("Title of tutorial is not defined")
	}
	if tutorial.Content == "" {
		panic("Content of tutorial is not defined")
	}

	db := GetDBCon()
	db.Create(&tutorial)

}
