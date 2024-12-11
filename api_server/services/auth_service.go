package services

import (
	"app/graph/model"
	models "app/models/generated"
	"app/validator"
	"app/view"
	"context"
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"

	"github.com/volatiletech/sqlboiler/v4/boil"
	"github.com/volatiletech/sqlboiler/v4/queries/qm"
	"golang.org/x/crypto/bcrypt"
)

type TokenString = string

type AuthService interface {
	SignUp(ctx context.Context, requestParams model.SignUpInput) (*models.User, error)
	SignIn(ctx context.Context, requestParams model.SignInInput) (TokenString, *models.User, error)
	GetAuthUser(ctx *gin.Context) (*models.User, error)
	Getuser(ctx context.Context, id int) *models.User
}

type authService struct {
	db *sql.DB
}

func NewAuthService(db *sql.DB) AuthService {
	return &authService{db}
}

func (as *authService) SignUp(ctx context.Context, requestParams model.SignUpInput) (*models.User, error) {
	// NOTE: バリデーションチェック
	validationErrors := validator.ValidateUser(requestParams)
	if validationErrors != nil {
		return &models.User{}, view.NewBadRequestView(validationErrors)
	}

	// NOTE: パラメータをアサイン
	user := models.User{}
	user.Name = requestParams.Name
	user.Email = requestParams.Email
	// NOTE: パスワードをハッシュ化の上、Create処理
	hashedPassword, err := as.encryptPassword(requestParams.Password)
	if err != nil {
		return &user, view.NewInternalServerErrorView(err)
	}
	user.Password = hashedPassword

	createErr := user.Insert(ctx, as.db, boil.Infer())
	if createErr != nil {
		return &user, view.NewInternalServerErrorView(createErr)
	}

	return &user, nil
}

func (as *authService) SignIn(ctx context.Context, requestParams model.SignInInput) (TokenString, *models.User, error) {
	// NOTE: emailからユーザの取得
	user, err := models.Users(qm.Where("email = ?", requestParams.Email)).One(ctx, as.db)
	if err != nil {
		return "", &models.User{}, view.NewNotFoundView(fmt.Errorf("メールアドレスまたはパスワードに該当するユーザが存在しません。"))
	}

	// NOTE: パスワードの照合
	if err := as.compareHashPassword(user.Password, requestParams.Password); err != nil {
		return "", &models.User{}, view.NewNotFoundView(fmt.Errorf("メールアドレスまたはパスワードに該当するユーザが存在しません。"))
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})
	// TODO: JWT_SECRETを環境変数に切り出す
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_TOKEN_KEY")))
	if err != nil {
		return "", &models.User{}, view.NewInternalServerErrorView(err)
	}
	return tokenString, user, nil
}

func (as *authService) GetAuthUser(ctx *gin.Context) (*models.User, error) {
	// NOTE: Cookieからtokenを取得
	tokenString, err := ctx.Cookie("token")
	if err != nil {
		return &models.User{}, err
	}
	// NOTE: tokenに該当するユーザを取得する
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(os.Getenv("JWT_TOKEN_KEY")), nil
	})
	if err != nil {
		return &models.User{}, fmt.Errorf("failt jwt parse")
	}

	var userID int
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID = int(claims["user_id"].(float64))
	}
	if userID == 0 {
		return &models.User{}, fmt.Errorf("invalid token")
	}
	user, err := models.FindUser(ctx, as.db, userID)
	return user, err
}

func (as *authService) Getuser(ctx context.Context, id int) *models.User {
	user, _ := models.FindUser(ctx, as.db, id)
	return user
}

// NOTE: パスワードの文字列をハッシュ化する
func (as *authService) encryptPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// NOTE: パスワードの照合
func (as *authService) compareHashPassword(hashedPassword, requestPassword string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(requestPassword)); err != nil {
		return err
	}
	return nil
}