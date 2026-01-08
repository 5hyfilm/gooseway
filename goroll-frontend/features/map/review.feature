Feature: Place Review Management
  As a GOROLL application user
  I want to review and rate accessible places
  So that I can share my accessibility experience and help other users

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: View place details from map
    Given I am on the map page
    When I click on a place marker for "EmQuartier"
    Then a slide-up panel should appear
    And I should see the place name "EmQuartier"
    And I should see the place category "Shopping Mall"
    And I should see accessibility information
    And I should see available accessibility features
    And I should see a "Write a review" button

  Scenario: Navigate to review form from place details
    Given I am viewing place details for "EmQuartier"
    When I click the "Write a review" button
    Then I should be redirected to the review form page
    And I should see the place name "EmQuartier" at the top
    And I should see accessibility feature options
    And I should see rating options for each feature

  Scenario: Submit complete accessibility review using thumbs up/down
    Given I am on the review form for "Union Mall"
    And I can see the place name "Union Mall" and category "Shopping Mall"
    When I click the thumbs up button for "Parking"
    And I click the thumbs up button for "Main Entrance" 
    And I click the thumbs up button for "Ramps"
    And I click the thumbs down button for "Pathways"
    And I click the thumbs up button for "Elevators"
    And I click the "Submit Review" button
    Then I should see a success message "Review submitted successfully"
    And I should be redirected to the place details page
    And my review should appear in the reviews list with the ratings I provided

  Scenario: Change rating selection for accessibility features
    Given I am on the review form for "Union Mall"
    When I click the thumbs up button for "Parking"
    Then the thumbs up button for "Parking" should be highlighted/selected
    And the thumbs down button for "Parking" should remain unselected
    When I click the thumbs down button for "Parking"
    Then the thumbs down button for "Parking" should be highlighted/selected
    And the thumbs up button for "Parking" should become unselected

  Scenario: Submit review without rating any features
    Given I am on the review form for "Union Mall"
    When I do not select any thumbs up or thumbs down buttons
    And I click the "Submit Review" button
    Then I should see an error message "Please rate at least one accessibility feature"
    And I should remain on the review form page

  Scenario: View existing written reviews for a place
    Given I am viewing place details for "MBK Center"
    And the place has existing reviews
    When I click on "View written reviews"
    Then a modal with written reviews should appear
    And I should see reviewer names and review dates
    And I should see star ratings for each review
    And I should see written comments for each review
    And I should see accessibility feature ratings
    When I click outside the modal or the close button
    Then the modal should close

  Scenario: Filter reviews by time period
    Given I am viewing place details for "Terminal 21"
    When I click on the "24 hours latest" filter
    Then I should see only reviews from the last 24 hours
    And the review count should update accordingly
    When I click on the "All" filter
    Then I should see all reviews regardless of time
    And the review count should show total reviews

  Scenario: Rate specific accessibility features with thumbs up/down
    Given I am on the review form for "Union Mall"
    When I rate the following features using thumbs up/down:
      | Feature        | Rating      |
      | Parking        | Thumbs Up   |
      | Main Entrance  | Thumbs Up   |
      | Ramps          | Thumbs Down |
      | Pathways       | Thumbs Up   |
      | Elevators      | Thumbs Down |
    And I click "Submit Review"
    Then my review should be saved with all feature ratings
    And the place's accessibility summary should be updated

  Scenario: Navigate back from review form
    Given I am on the review form for "Union Mall"
    When I click the back arrow button in the header
    Then I should be navigated back to the place details page
    And any unsaved changes should be lost
    And I should see a confirmation dialog if I have made changes

  Scenario: Expand and collapse photo upload sections
    Given I am on the review form for "Union Mall"
    When I click on the "Add photos" section under "Parking"
    Then the photo upload interface should expand
    And I should see options to take a photo or select from gallery
    When I click away or click the collapse arrow
    Then the photo upload section should collapse
    And I should see only the "Add photos" text again

  Scenario: Upload multiple photos for different features
    Given I am on the review form for "Union Mall"
    When I upload 2 photos to "Parking" section
    And I upload 1 photo to "Main Entrance" section
    And I upload 3 photos to "Ramps" section
    Then I should see all photos organized under their respective features
    And each photo should have a delete option
    When I delete 1 photo from "Ramps" section
    Then I should see only 2 photos remaining in "Ramps" section

  Scenario: Complete review form interaction flow
    Given I am on the review form for "Union Mall"
    When I click thumbs up for "Parking"
    And I upload a photo showing accessible parking spaces
    And I click thumbs down for "Ramps"
    And I upload a photo showing ramp issues
    And I click thumbs up for "Main Entrance"
    And I click thumbs up for "Pathways" 
    And I click thumbs up for "Elevators"
    And I click thumbs up for "Restrooms"
    And I click thumbs up for "Seating Areas"
    And I click thumbs up for "Staff Assistance"
    And I click thumbs up for "Other"
    And I submit the review
    Then my review should be saved with all ratings and photos
    And I should be redirected to the place details
    And my review should appear with the correct thumbs up/down indicators and photos

  Scenario: Add photos to specific accessibility features
    Given I am on the review form for "Union Mall"
    When I click the "Add photos" option under "Parking"
    And I select 2 photos from my device showing parking accessibility
    Then I should see thumbnails of the selected photos under "Parking"
    When I click the "Add photos" option under "Main Entrance"
    And I select 1 photo showing the entrance
    Then I should see the photo thumbnail under "Main Entrance"
    When I rate "Parking" with thumbs up and "Main Entrance" with thumbs up
    And I submit the review
    Then my review should include the photos for each respective feature

  Scenario: View accessibility features available for rating
    Given I am on the review form for "Union Mall"
    Then I should see the following accessibility features available for rating:
      | Feature        |
      | Parking        |
      | Main Entrance  |
      | Ramps          |
      | Pathways       |
      | Elevators      |
      | Restrooms      |
      | Seating Areas  |
      | Staff Assistance |
      | Other          |
    And each feature should have thumbs up and thumbs down buttons
    And each feature should have an "Add photos" option

#   Scenario: Edit my existing review
#     Given I have previously reviewed "Union Mall"
#     And my previous review had "Parking" rated as thumbs up and "Elevators" rated as thumbs down
#     And I am viewing the place details
#     When I click on my existing review
#     Then I should see an "Edit Review" option
#     When I click "Edit Review"
#     Then I should be taken to the review form
#     And my previous thumbs up/down selections should be pre-filled
#     And I should see "Parking" with thumbs up selected
#     And I should see "Elevators" with thumbs down selected
#     When I change the "Parking" rating from thumbs up to thumbs down
#     And I change the "Elevators" rating from thumbs down to thumbs up
#     And I click "Update Review"
#     Then my review should be updated with the new ratings

#   Scenario: Delete my review
#     Given I have previously reviewed "Asiatique The Riverfront"
#     And I am viewing my review in the place details
#     When I click on the delete option for my review
#     Then I should see a confirmation dialog "Are you sure you want to delete this review?"
#     When I click "Confirm Delete"
#     Then my review should be removed from the place
#     And I should see a success message "Review deleted successfully"
#     And the "Write a review" button should appear again

  Scenario: View place accessibility summary based on thumbs up/down ratings
    Given I am viewing place details for "Union Mall"
    And the place has multiple reviews with thumbs up/down ratings
    Then I should see an accessibility summary showing:
      | Feature        | Positive Rating | Total Reviews |
      | Parking        | 85%            | 20           |
      | Main Entrance  | 95%            | 18           |
      | Ramps          | 70%            | 15           |
      | Pathways       | 60%            | 22           |
      | Elevators      | 90%            | 16           |
      | Restrooms      | 80%            | 19           |
      | Seating Areas  | 75%            | 14           |
      | Staff Assistance | 88%         | 17           |
      | Other          | 92%            | 21           |
    And I should see the overall accessibility percentage
    And I should see the total number of reviews

#   Scenario: Report inappropriate review
#     Given I am viewing reviews for "Gaysorn Village"
#     And I see a review that contains inappropriate content
#     When I click the "Report" button on that review
#     Then I should see report options:
#       | Reason                    |
#       | Inappropriate language    |
#       | False information         |
#       | Spam                      |
#       | Harassment                |
#       | Other                     |
#     When I select "False information" and provide additional details
#     And I click "Submit Report"
#     Then I should see "Thank you for your report" message
#     And the review should be flagged for admin review

  Scenario: Add photos to review
    Given I am on the review form for "Union Mall"
    When I click the "Add photos" button under any accessibility feature
    And I select 3 photos from my device showing accessibility features
    Then I should see thumbnails of the selected photos under that feature
    And I should be able to add captions to each photo
    When I complete the review and submit
    Then my review should include the photos under the correct features
    And other users should be able to view the photos in my review

#   Scenario: Review place that doesn't exist in system
#     Given I want to review a place called "New Accessible Cafe"
#     And this place is not yet in the GOROLL system
#     When I search for "New Accessible Cafe" on the map
#     And no results are found
#     Then I should see a "Suggest New Place" option
#     When I click "Suggest New Place"
#     Then I should be able to enter place details:
#       | Field        | Value                |
#       | Place Name   | New Accessible Cafe  |
#       | Address      | 123 Sukhumvit Road   |
#       | Category     | Cafe                 |
#       | Phone        | 02-123-4567          |
#     And I should be able to submit a review for this new place

#   Scenario: View my review history
#     Given I am logged into the application
#     When I navigate to my profile page
#     And I click on "My Reviews" section
#     Then I should see a list of all places I have reviewed
#     And each entry should show:
#       - Place name and category
#       - My rating and review date
#       - Review status (published/pending)
#     When I click on any review
#     Then I should be taken to that place's detail page
#     And my review should be highlighted