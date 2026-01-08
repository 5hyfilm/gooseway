
Feature: Report Obstacle
  As a GOROLL application user
  I want to report obstacles that I encounter
  So that other users can be aware of accessibility barriers and plan alternative routes

  Background:
    Given I am a logged-in user of the GOROLL application
    And I have location permissions enabled
    And I am on the map screen

  Scenario: Report a new obstacle with basic information
    Given I am at a location where I encounter an accessibility barrier
    When I tap the "Report Obstacle" button
    And I select category "Sidewalk Issues"
    And I select obstacle type "Rough Surface"
    And I enter title "Rough surface near MRT exit"
    And I enter description "Multiple broken tiles that may cause wheelchair to get stuck"
    And I tap "Submit Report"
    Then the obstacle should be saved successfully
    And I should see a confirmation message "Thank you for reporting"
    And the obstacle should appear on the map with a red marker
    And the obstacle status should be "active"

  Scenario: Report obstacle with photo evidence
    Given I am reporting a new obstacle
    When I tap "Add Photos"
    And I take a photo of the obstacle
    And I tap "Use Photo"
    Then I should see the selected photo in the report
    And the photo count should show "Selected photo 1"
    When I submit the report
    Then the obstacle should be saved with the attached photo
    And other users should be able to see the photo when viewing obstacle details

  Scenario: Report obstacle using current location
    Given I am at coordinates [13.7466, 100.5347]
    When I start reporting a new obstacle
    And I tap "Use Current Location"
    Then the obstacle location should be set to my current coordinates
    And I should see "Current location used" confirmation
    And the location coordinates should be displayed on the form

  Scenario: Report obstacle by selecting location on map
    Given I am reporting a new obstacle
    When I tap "Select on Map"
    Then I should see the map with a crosshair cursor
    When I tap on coordinates [13.7457, 100.5331]
    And I tap "Confirm Location"
    Then the obstacle location should be set to the selected coordinates
    And I should return to the report form
    And the selected location should be displayed

  Scenario: Select obstacle category and type
    Given I am filling out an obstacle report
    When I tap the category dropdown
    Then I should see the following categories:
      | Category | Icon | Label |
      | sidewalk_issues | 🛑 | Sidewalk Issues |
      | permanent_obstacles | 🚧 | Permanent Obstacles |
      | temporary_obstacles | ⚠️ | Temporary Obstacles |
      | other_obstacles | ❓ | Other Issues |
    When I select "Sidewalk Issues"
    And I tap the type dropdown
    Then I should see the following types:
      | Type | Label |
      | rough_surface | Rough/Damaged Surface |
      | broken_drain | Broken Drain/Missing Cover |
      | narrow_path | Path Too Narrow |
      | no_ramp | No Ramp Available |

  Scenario: Report obstacle with detailed permanent barrier information
    Given I encounter a permanent accessibility barrier
    When I report a new obstacle
    And I select category "Permanent Obstacles"
    And I select type "No Lift Available"
    And I enter title "Footbridge without lift access"
    And I enter description "Only stairs available, not suitable for wheelchairs"
    And I add multiple photos showing the barrier
    And I submit the report
    Then the obstacle should be marked as "permanent"
    And it should appear with a construction icon on the map
    And other users should receive high-priority notifications when routing near this area

  Scenario: Report temporary obstacle
    Given I encounter a temporary accessibility barrier
    When I report a new obstacle
    And I select category "Temporary Obstacles"
    And I select type "Vehicles on Sidewalk"
    And I enter title "Cars parked on sidewalk"
    And I enter description "Cars regularly park on sidewalk during evening hours"
    And I submit the report
    Then the obstacle should be marked as "temporary"
    And it should be scheduled for automatic verification after 7 days
    And it should appear with a warning icon on the map

  Scenario: View and verify existing obstacle
    Given there is an existing obstacle reported by another user
    When I navigate to the obstacle location on the map
    And I tap on the obstacle marker
    Then I should see the obstacle details popup
    And I should see options "Still Present" and "No Longer Present"
    When I tap "Still Present"
    Then the verification count should increase by 1
    And the obstacle status should remain "active"
    And I should see "Thank you for verifying" message

  Scenario: Report obstacle as resolved
    Given there is an active obstacle on the map
    When I view the obstacle details
    And I tap "No Longer Present"
    And I confirm my verification
    Then the resolved count should increase by 1
    And if resolved count > still present count, the status should change to "resolved"
    And the obstacle marker should change to green color
    And other users should be notified that the obstacle may be resolved


  Scenario: Report obstacle with insufficient information
    Given I am reporting a new obstacle
    When I select a category but leave the type empty
    And I leave the title field empty
    And I tap "Submit Report"
    Then I should see validation errors:
      | Field | Error Message |
      | Type | Please select obstacle type |
      | Title | Please enter obstacle title |
    And the report should not be submitted

  Scenario: Report duplicate obstacle
    Given there is already an obstacle reported at coordinates [13.7466, 100.5347]
    When I try to report a new obstacle within 10 meters of the existing one
    Then I should see a warning "Similar obstacle already reported nearby"
    And I should see options to:
      | Option | Action |
      | "View Existing" | Show the existing obstacle details |
      | "Verify Existing" | Add verification to existing obstacle |
      | "Report New" | Continue with new report |

  Scenario: Report obstacle without internet connection
    Given I am offline with no internet connection
    When I report a new obstacle with all required information
    And I tap "Submit Report"
    Then the report should be saved locally
    And I should see "Report saved locally - will sync when online"
    When internet connection is restored
    Then the locally saved report should automatically sync to the server
    And I should receive confirmation "Report synced successfully"

