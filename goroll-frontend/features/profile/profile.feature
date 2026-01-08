Feature: User Profile Management
  As a GOROLL application user
  I want to manage my profile information
  So that I can maintain accurate personal details and showcase my accessibility journey

  Background:
    Given I am a logged-in user with profile data

  Scenario: View my profile page
    When I navigate to the profile page
    Then I should see my profile picture
    And I should see my name "Tendou Souji"
    And I should see my status "Active Explorer"
    And I should see "15" routes count
    And I should see "5" posts count
    And I should see "243" following count
    And I should see "512" followers count
    And I should see the "My Posts" section
    And I should see the "Route Library" section
    And I should see the "Wheelchair Information" section

  Scenario: Navigate to edit profile page
    Given I am on the profile page
    When I click the edit profile button
    Then I should be redirected to the profile edit page
    And I should see the page title "Edit Profile"
    And I should see my current name "Tendou Souji" in the form
    And I should see my current email "tendou@example.com" in the form
    And I should see my current phone "099-999-9999" in the form

  Scenario: Successfully update profile information
    Given I am on the profile edit page
    When I enter "John Smith" in the full name field
    And I enter "johnsmith@example.com" in the email field
    And I enter "088-777-6666" in the phone field
    And I click the "Save" button
    Then I should see "Saving..." loading text
    And I should be redirected to the profile page
    And I should see the updated name "John Smith"

  Scenario: Upload new profile picture
    Given I am on the profile edit page
    When I click the camera icon on the profile picture
    And I select a new image file
    Then I should see the new image preview
    When I click the "Save" button
    Then I should be redirected to the profile page
    And I should see my updated profile picture

  Scenario: Remove profile picture
    Given I am on the profile edit page
    And I have a profile picture set
    When I click the "Remove photo" button
    Then I should see a confirmation dialog "Confirm remove photo"
    And I should see the message "Are you sure you want to remove your profile photo?"
    When I click confirm
    Then the dialog should close
    And my profile picture should be replaced with default image

  Scenario: Cancel profile picture removal
    Given I am on the profile edit page
    And I have clicked the "Remove photo" button
    And the confirmation dialog is open
    When I click cancel
    Then the dialog should close
    And my current profile picture should remain unchanged

  Scenario: Navigate back from edit profile
    Given I am on the profile edit page
    When I click the back arrow button
    Then I should be redirected to the profile page

  Scenario: Failed to save with empty full name
    Given I am on the profile edit page
    When I clear the full name field
    And I click the "Save" button
    Then I should see an error message "Full name is required"
    And I should remain on the profile edit page

  Scenario: Failed to save with invalid email
    Given I am on the profile edit page
    When I enter "invalidemail" in the email field
    And I click the "Save" button
    Then I should see an error message "Invalid email format"
    And I should remain on the profile edit page

  Scenario: Failed to save with empty email
    Given I am on the profile edit page
    When I clear the email field
    And I click the "Save" button
    Then I should see an error message "Email is required"
    And I should remain on the profile edit page

  Scenario: View my posts section when I have posts
    Given I am on the profile page
    And I have created some posts
    When I scroll to the "My Posts" section
    Then I should see my published posts
    # And I should see a "Create Post" button

  Scenario: View my posts section when I have no posts
    Given I am on the profile page
    And I have not created any posts
    When I scroll to the "My Posts" section
    Then I should see "No posts yet" message
    # And I should see a "Create Post" button

  Scenario: View route library section
    Given I am on the profile page
    When I look at the Route Library section
    Then I should see "All Routes" tab
    And I should see "Recorded" tab
    And I should see "Saved" tab
    And I should see my route statistics

  Scenario: View wheelchair information section
    Given I am on the profile page
    When I scroll to the wheelchair information section
    Then I should see my wheelchair details
    And I should see wheelchair specifications

  Scenario: Navigate to edit wheelchair information
    Given I am on the profile page
    When I click the "Edit Wheelchair Info" button in the wheelchair section
    Then I should be redirected to the wheelchair edit page
    And I should see the page title "Wheelchair Information"
    And I should see wheelchair form fields

  Scenario: Update wheelchair foldable status to foldable
    Given I am on the wheelchair edit page
    When I select "Yes" for "Can your wheelchair fold?"
    And I enter "65" in the width field
    And I enter "90" in the length field
    And I enter "85" in the height field
    And I enter "15" in the weight field
    And I enter "45" in the folded width field
    And I enter "75" in the folded length field
    And I enter "30" in the folded height field
    And I click the "Save" button
    Then I should be redirected to the profile page
    And I should see the updated wheelchair information

  Scenario: Update wheelchair foldable status to non-foldable
    Given I am on the wheelchair edit page
    When I select "No" for "Can your wheelchair fold?"
    And I enter "70" in the width field
    And I enter "95" in the length field
    And I enter "90" in the height field
    And I enter "18" in the weight field
    And I click the "Save" button
    Then I should see only regular dimensions fields
    And I should not see folded dimensions fields
    And I should be redirected to the profile page
    And I should see the updated wheelchair information

  Scenario: Add wheelchair notes
    Given I am on the wheelchair edit page
    When I enter "Electric wheelchair with ramp access needed" in the notes field
    And I click the "Save" button
    Then I should be redirected to the profile page
    And I should see the wheelchair notes in the wheelchair section

  Scenario: Failed to save wheelchair info with empty required fields
    Given I am on the wheelchair edit page
    When I clear the width field
    And I click the "Save" button
    Then I should see an error message "Width is required"
    And I should remain on the wheelchair edit page

  Scenario: Failed to save wheelchair info with invalid dimensions
    Given I am on the wheelchair edit page
    When I enter "0" in the width field
    And I click the "Save" button
    Then I should see an error message "Width must be greater than 0"
    And I should remain on the wheelchair edit page

  Scenario: Switch language from Thai to English
    Given I am on the profile page
    And the application is in Thai
    When I click the settings button
    And I navigate to language options
    And I select English language
    Then I should see "Profile" instead of "โปรไฟล์"
    And I should see "Edit Profile" instead of "แก้ไขโปรไฟล์"
    And all text should be displayed in English

  Scenario: Handle save error
    Given I am on the profile edit page
    And I have updated my profile information
    When I click the "Save" button
    And the server returns an error
    Then I should see an error message
    And I should remain on the profile edit page
    And my changes should still be in the form
    And the save button should be enabled for retry