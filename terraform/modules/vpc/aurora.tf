resource "aws_db_subnet_group" "aurora" {
  name       = "tend-attend-aurora-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}
