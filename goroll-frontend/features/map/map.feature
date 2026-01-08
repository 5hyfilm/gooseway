Feature: Map Navigation and Location Search
  As a GOROLL application user
  I want to use an interactive map to find accessible locations
  So that I can plan my journey efficiently

  Background:
    Given I am logged in to the GOROLL application
    And I am on the map page

  Scenario: View current location on the map
    When I click the location button
    Then the map should center on my current location
    And a marker should be displayed at my current location

  Scenario: Search for a location
    When I enter "EmQuartier" in the search bar
    And I press Enter
    Then the map should center on the searched location
    And a search result marker should be displayed
    And I should see a list of nearby accessible locations

  Scenario: View location details from the map
    When I click on a location marker
    Then a slide-up panel should appear
    And I should see the location name and category
    And I should see the accessibility information
    And I should see the location features

  Scenario: Filter location accessibility by recent data
    When I view a location's details
    And I click on the "24 hours latest" filter
    Then I should see accessibility data from the last 24 hours only
    
  Scenario: Filter location accessibility by all data
    When I view a location's details
    And I click on the "All" filter
    Then I should see all accessibility data regardless of time

  Scenario: View written reviews for a location
    When I view a location's details
    And I click on "View written reviews"
    Then a modal with written reviews should appear
    And I should see the name, date, and rating of each review
    And I should see the text content of each review

  Scenario: Close location details panel
    When a location details panel is open
    And I click the close button
    Then the panel should slide down and disappear
    And I should see the full map again

  Scenario: Write a review for a location
    When I view a location's details
    And I click the "Write a review" button
    Then I should be redirected to the review page for that location

  Scenario: Toggle routes visibility
    Given there are active routes on the map
    When I click on the eye icon
    Then the routes should disappear from the map
    When I click on the crossed eye icon
    Then the routes should reappear on the map

  Scenario: View obstacle information
    When I click on an obstacle marker
    Then a slide-up panel should appear
    And I should see the obstacle type and description
    And I should see when the obstacle was reported
    And I should see verification information about the obstacle

  Scenario: Verify obstacle status
    When I view an obstacle's details
    And I click "Still present"
    Then the obstacle's verification count should increase
    And the obstacle status should update to "active"

  Scenario: Report obstacle resolved
    When I view an obstacle's details
    And I click "No longer present"
    Then the obstacle's resolved count should increase
    And the obstacle status should update to "resolved"

  Scenario: Open nearby accessible locations panel
    When I search for a location
    Then a nearby accessible locations panel should appear
    And I should see a list of locations sorted by distance
    And each location should display its accessibility level

  Scenario: Select location from nearby panel
    When the nearby accessible locations panel is open
    And I click on a location from the list
    Then the map should center on the selected location
    And the nearby panel should close
    And the location marker should be highlighted

  Scenario: Close nearby accessible locations panel
    When the nearby accessible locations panel is open
    And I click the close button
    Then the panel should close
    And I should see the full map again