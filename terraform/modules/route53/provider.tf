terraform {
  required_providers {
    aws = {
      configuration_aliases = [aws, aws.us_east_1]
    }
  }
}
