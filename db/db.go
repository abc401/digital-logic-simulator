package db

import (
	"database/sql"
	"fmt"
	"math/rand"
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
	err = db.AutoMigrate(&models.MCQ{})
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

func AddMCQs() {
	stmts := []string{
		"Hello", "How Are You?", "I am fine",
	}
	options := []string{
		"option", "1", "2", "qwerty", "lorem", "ipsum", "all of above",
	}
	article_ids := []uint{1, 2, 3, 4}

	con := GetGormDBCon()

	for i := 0; i < 10; i++ {
		mcq := models.MCQ{}

		idx := rand.Intn(len(stmts))
		mcq.Statement = stmts[idx]

		idx = rand.Intn(len(options))
		mcq.Option1 = options[idx]

		idx = rand.Intn(len(options))
		mcq.Option2 = options[idx]

		idx = rand.Intn(len(options))
		mcq.Option3 = options[idx]

		idx = rand.Intn(len(options))
		mcq.Option4 = options[idx]

		idx = rand.Intn(len(article_ids))
		mcq.ArticleID = article_ids[idx]

		mcq.CorrectOption = uint(rand.Intn(4) + 1)

		con.Create(&mcq)
	}
}
