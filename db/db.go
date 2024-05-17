package db

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/abc401/digital-logic-simulator/models"
	"github.com/go-sql-driver/mysql"
	gormDb "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const Dsn = "root:1234@tcp(localhost:3306)/dls"

var cfg = mysql.Config{
	User:   "root",
	Passwd: "1234",
	Net:    "tcp",
	Addr:   "127.0.0.1:3306",
	DBName: "dls",
}

func GetDBCon() *sql.DB {
	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		panic(err.Error())
	}
	return db
}

func GetGormDBCon() *gorm.DB {
	db, err := gorm.Open(gormDb.Open(cfg.FormatDSN()), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}
	return db

}

func AutoMigrate() {
	db := GetGormDBCon()
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
	db := GetGormDBCon()
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

	db := GetGormDBCon()
	db.Create(&tutorial)

}
