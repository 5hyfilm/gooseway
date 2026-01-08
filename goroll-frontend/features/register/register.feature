Feature: User Registration
  As a GOROLL application user
  I want to register for a new account
  So that I can access the GOROLL services

  Background:
    Given I am on the GOROLL signup page
    And I can see the GOROLL logo with user icon
    And I can see "Please enter your details." message

  Scenario: Successful user registration with valid data
    Given I am on the signup form
    When I enter "john.doe@example.com" in the email field
    And I enter "John Doe" in the name-surname field
    And I enter "0812345678" in the mobile number field
    And I enter "Password123!" in the password field
    And I enter "Password123!" in the confirm password field
    And I click the "Sign up" button
    Then I should see a successful registration message
    And I should be redirected to the next page

  Scenario: Failed registration with invalid email format
    Given I am on the signup form
    When I enter "invalid-email" in the email field
    And I enter "John Doe" in the name-surname field
    And I enter "0812345678" in the mobile number field
    And I enter "Password123!" in the password field
    And I enter "Password123!" in the confirm password field
    And I click the "Sign up" button
    Then I should see an email format error message
    And I should remain on the signup page

  Scenario: Failed registration with empty required fields
    Given I am on the signup form
    When I leave the email field empty
    And I leave the name-surname field empty
    And I enter "0812345678" in the mobile number field
    And I enter "Password123!" in the password field
    And I enter "Password123!" in the confirm password field
    And I click the "Sign up" button
    Then I should see error messages for required fields
    And I should remain on the signup page

  Scenario: Password validation - too short password
    Given I am on the signup form
    When I enter "john.doe@example.com" in the email field
    And I enter "John Doe" in the name-surname field
    And I enter "0812345678" in the mobile number field
    And I enter "Pass1!" in the password field
    Then I should see that the password length requirement is not met
    And the password requirements should show "Be between 8 and 20 characters" as unchecked

  Scenario: Password validation - missing character types
    Given I am on the signup form
    When I enter "john.doe@example.com" in the email field
    And I enter "John Doe" in the name-surname field
    And I enter "0812345678" in the mobile number field
    And I enter "password123" in the password field
    Then I should see that the character type requirement is not fully met
    And the password requirements should show missing character types

  Scenario: Password validation - valid password meeting all requirements
    Given I am on the signup form
    When I enter "Password123!" in the password field
    Then I should see that all password requirements are met
    And the password requirements should show:
      | requirement | status |
      | Be between 8 and 20 characters | checked |
      | Include at least two of the following | checked |

  Scenario: Password confirmation mismatch
    Given I am on the signup form
    When I enter "john.doe@example.com" in the email field
    And I enter "John Doe" in the name-surname field
    And I enter "0812345678" in the mobile number field
    And I enter "Password123!" in the password field
    And I enter "DifferentPassword!" in the confirm password field
    And I click the "Sign up" button
    Then I should see a password mismatch error message
    And I should remain on the signup page

  Scenario: Toggle password visibility
    Given I am on the signup form
    When I enter "Password123!" in the password field
    And I click the eye icon next to the password field
    Then I should see the password in plain text
    When I click the eye icon again
    Then I should see the password as masked characters

  Scenario: Toggle confirm password visibility
    Given I am on the signup form
    When I enter "Password123!" in the confirm password field
    And I click the eye icon next to the confirm password field
    Then I should see the confirm password in plain text
    When I click the eye icon again
    Then I should see the confirm password as masked characters

  Scenario: Language selection
    Given I am on the signup page
    And I can see language options "TH" and "EN"
    When I click on "TH" language option
    Then the page content should be displayed in Thai language
    When I click on "EN" language option
    Then the page content should be displayed in English language

  Scenario: Mobile number validation
    Given I am on the signup form
    When I enter "john.doe@example.com" in the email field
    And I enter "John Doe" in the name-surname field
    And I enter "123" in the mobile number field
    And I enter "Password123!" in the password field
    And I enter "Password123!" in the confirm password field
    And I click the "Sign up" button
    Then I should see a mobile number format error message
    And I should remain on the signup page

  Scenario: Form field validation on blur
    Given I am on the signup form
    When I click on the email field
    And I enter "invalid-email"
    And I click outside the email field
    Then I should see an inline email validation error
    When I correct the email to "john.doe@example.com"
    And I click outside the email field
    Then the email validation error should disappear