# Configure the AWS Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

# Create an S3 bucket
resource "aws_s3_bucket" "example" {
  bucket = "mandelbrot-assets"

  # Resourse description
  tags = {
    Description = "Assets which I use in Mandelbrot set Explorer on GitHub Pages"
  }
}