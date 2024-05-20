package math

type Vec2 struct {
	X float64
	Y float64
}

func NewVec2(x float64, y float64) Vec2 {
	return Vec2{
		X: x,
		Y: y,
	}
}

func (vec Vec2) Add(other Vec2) Vec2 {
	return Vec2{
		X: vec.X + other.X,
		Y: vec.Y + other.Y,
	}
}

func (vec Vec2) Neg() Vec2 {
	return Vec2{
		X: -vec.X,
		Y: -vec.Y,
	}
}

func (vec Vec2) Sub(other Vec2) Vec2 {
	return vec.Add(other.Neg())
}

func (vec Vec2) ScalarDiv(dividend float64) Vec2 {
	return Vec2{
		X: vec.X / dividend,
		Y: vec.Y / dividend,
	}
}
func (vec Vec2) ScalarMul(multiplier float64) Vec2 {
	return Vec2{
		X: vec.X * multiplier,
		Y: vec.Y * multiplier,
	}
}

func Clamp(value float64, min float64, max float64) float64 {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value

}
