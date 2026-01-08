Feature: User Login
  As a GOROLL application user
  I want to be able to login to the system
  So that I can access my personalized features and data

  Background:
    Given I am on the login page

  Scenario: Successful login with valid credentials
    When I enter "test@example.com" in the email field
    And I enter "password123" in the password field
    And I click the "Sign in" button
    Then I should be redirected to the map page
    And I should see the map interface

  Scenario: Failed login with invalid email
    When I enter "invalid@email" in the email field
    And I enter "password123" in the password field
    And I click the "Sign in" button
    Then I should see an error message "Invalid email address"
    And I should remain on the login page

  Scenario: Failed login with empty email
    When I leave the email field empty
    And I enter "password123" in the password field
    And I click the "Sign in" button
    Then I should see an error message "Email is required"
    And I should remain on the login page

  Scenario: Failed login with empty password
    When I enter "test@example.com" in the email field
    And I leave the password field empty
    And I click the "Sign in" button
    Then I should see an error message "Password is required"
    And I should remain on the login page

  Scenario: Failed login with short password
    When I enter "test@example.com" in the email field
    And I enter "short" in the password field
    And I click the "Sign in" button
    Then I should see an error message "Password must be at least 8 characters"
    And I should remain on the login page

  Scenario: Failed login with incorrect credentials
    When I enter "test@example.com" in the email field
    And I enter "wrongpassword" in the password field
    And I click the "Sign in" button
    Then I should see an error message "Invalid email or password"
    And I should remain on the login page

  Scenario: Login with remember me option
    When I enter "test@example.com" in the email field
    And I enter "password123" in the password field
    And I check the "Remember me" checkbox
    And I click the "Sign in" button
    Then I should be redirected to the map page
    And my login session should be remembered on next visit

  Scenario: Navigate to signup page from login page
    When I click on the "Sign up" link
    Then I should be redirected to the signup page

  Scenario: Navigate to forgot password page from login page
    When I click on the "Forgot password?" link
    Then I should be redirected to the forgot password page

#   Scenario: Login with Google
#     When I click the "Continue with Google" button
#     Then the Google authentication window should open
#     And after successful Google authentication I should be logged in
#     And I should be redirected to the map page