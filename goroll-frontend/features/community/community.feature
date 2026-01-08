Feature: Community Post Viewing
  As a GOROLL application user
  I want to view community posts
  So that I can discover accessible places and routes shared by other users

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: View community post list
    Given I am on the community page
    When I view the post list
    Then I should see posts with titles, usernames, like counts, and comment counts
    And I should see post categories like "Guides & Tips", "Equipment Reviews", "Inspiring Stories", "News & Events", "Support Services", "Suggested Routes", "Health & Self Care", "Career & Work"
    And I should see post thumbnails

  Scenario: View individual post details
    Given I am on the community page
    And there are posts available
    When I tap on a specific post
    Then I should be navigated to the post detail page
    And I should see the post title, content, author information
    And I should see the post creation date
    And I should see post tags
    And I should see like and comment counts

  Scenario: View post image gallery
    Given I am viewing a post detail page
    And the post has multiple images
    When I view the post images
    Then I should see the first image displayed
    And I should see navigation arrows to browse through images
    When I tap the next arrow
    Then I should see the next image in the gallery
    When I tap the previous arrow
    Then I should see the previous image in the gallery

Feature: Community Post Interaction
  As a GOROLL application user
  I want to interact with community posts
  So that I can engage with the community and show appreciation for helpful content

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: Like a post
    Given I am viewing a post detail page
    And the post is not liked by me
    When I tap the like button
    Then the like button should become filled/highlighted
    And the like count should increase by 1
    And the post should be marked as liked by me

  Scenario: Unlike a post
    Given I am viewing a post detail page
    And the post is already liked by me
    When I tap the like button
    Then the like button should become unfilled/unhighlighted
    And the like count should decrease by 1
    And the post should be unmarked as liked by me

  # Scenario: Save/bookmark a post
  #   Given I am viewing a post detail page
  #   And the post is not saved by me
  #   When I tap the save/bookmark button
  #   Then the save button should become highlighted
  #   And the post should be added to my saved posts

  # Scenario: Unsave/unbookmark a post
  #   Given I am viewing a post detail page
  #   And the post is already saved by me
  #   When I tap the save/bookmark button
  #   Then the save button should become unhighlighted
  #   And the post should be removed from my saved posts

Feature: Community Comments
  As a GOROLL application user
  I want to read and write comments on posts
  So that I can engage in discussions about accessibility experiences

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: View post comments
    Given I am viewing a post detail page
    And the post has comments
    When I tap on the comments section or comments button
    Then I should see all comments for the post
    And each comment should show the commenter's username
    And each comment should show the comment content
    And each comment should show the comment timestamp

  Scenario: View post with no comments
    Given I am viewing a post detail page
    And the post has no comments
    When I view the comments section
    Then I should see a message indicating no comments exist
    And I should see an invitation to be the first to comment

  Scenario: Add a comment to a post
    Given I am viewing a post detail page
    And I am logged in
    When I type a comment in the comment input field
    And I submit the comment
    Then my comment should appear in the comments list
    And the comment count should increase by 1
    And the comment should show my username
    And the comment should show the current timestamp

  Scenario: Submit empty comment
    Given I am viewing a post detail page
    And I am in the comment input field
    When I try to submit an empty comment
    Then the comment should not be posted
    And I should remain in the comment input field

Feature: Community Post Categories
  As a GOROLL application user
  I want to view posts by category
  So that I can find specific types of accessibility information

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario Outline: View posts by category
    Given I am on the community page
    When I filter posts by "<category>" category
    Then I should see only posts categorized as "<category>"
    And each post should display information relevant to "<category>"
    Examples:
      | category           |
      | All                |
      | Guides & Tips      |
      | Equipment Reviews  |
      | Inspiring Stories  |
      | News & Events      |
      | Support Services   |
      | Suggested Routes   |
      | Health & Self Care |
      | Career & Work      |

Feature: Community Post Creation
  As a GOROLL application user
  I want to create and share new posts
  So that I can contribute accessibility information to the community

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: Access create post page
    Given I am on the community page
    When I tap the "Create Post" button
    Then I should be navigated to the add post page
    And I should see form fields for title, content, category
    And I should see options to upload images

  Scenario: Create a post with required fields
    Given I am on the add post page
    When I enter a post title
    And I select a category
    And I enter post content
    And I tap the submit button
    Then the post should be created successfully
    And I should be redirected to the community page
    And I should see my new post in the list

  Scenario: Create a post with images
    Given I am on the add post page
    When I enter a post title
    And I select a category
    And I upload one or more images
    And I tap the submit button
    Then the post should be created with the uploaded images
    And the images should be displayed in the post

  Scenario: Create a post with location
    Given I am on the add post page
    When I enter a post title
    And I select a category
    And I add a location
    And I tap the submit button
    Then the post should be created with location information
    And the location should be displayed in the post

  Scenario: Submit post without required fields
    Given I am on the add post page
    When I try to submit without entering a title
    Then the submit button should be disabled
    And I should remain on the add post page

  Scenario: Submit post without category
    Given I am on the add post page
    When I enter a title but do not select a category
    Then the submit button should be disabled
    And I should not be able to submit the post

  Scenario: Remove uploaded image
    Given I am on the add post page
    And I have uploaded an image
    When I tap the remove button on the image
    Then the image should be removed from the upload list
    And I should be able to upload a different image

  Scenario: Cancel post creation
    Given I am on the add post page
    And I have entered some content
    When I tap the back button
    Then I should return to the previous page
    And my post draft should not be saved

  Scenario: Loading state during post submission
    Given I am on the add post page
    And I have filled in all required fields
    When I tap the submit button
    Then I should see a loading indicator
    And the submit button should be disabled during submission

Feature: Community Search
  As a GOROLL application user
  I want to search for community posts
  So that I can quickly find specific information about accessibility

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application
    
  Scenario: Search posts by keyword
    Given I am on the community page
    When I enter "wheelchair accessible" in the search field
    And I tap the search button or press enter
    Then I should see posts containing the keyword "wheelchair accessible"
    And the search results should be highlighted
    And I should see the number of search results
  
  Scenario: Search with no results
    Given I am on the community page
    When I enter "nonexistent keyword" in the search field
    And I tap the search button or press enter
    Then I should see a "no results found" message
    And I should see suggestions to try different keywords
    And I should have an option to clear the search
  
  Scenario: Search with empty input
    Given I am on the community page
    When I tap the search button without entering any text
    Then I should see all posts as normal
    And no search filtering should be applied
  
  Scenario: Clear search results
    Given I am on the community page
    And I have performed a search with results
    When I clear the search field or tap the clear button
    Then I should see all posts again
    And the search highlighting should be removed
  
  Scenario: Search by tags
    Given I am on the community page
    When I enter a tag keyword like "Bangkok" in the search field
    And I perform the search
    Then I should see posts that contain the "Bangkok" tag
    And the matching tags should be highlighted in the results
  
  Scenario: Search autocomplete suggestions
    Given I am on the community page
    When I start typing in the search field
    Then I should see search suggestions appear
    And I should be able to tap on a suggestion to select it
    When I tap on a suggestion
    Then the search should be performed with the selected term


Feature: Community Post Sharing
  As a GOROLL application user
  I want to share helpful posts with others
  So that I can spread awareness about accessibility information

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: Share a post
    Given I am viewing a post detail page
    When I tap the share button
    Then I should see sharing options
    And I should be able to share the post through various platforms

# Feature: Community Admin Posts
#   As a GOROLL application user
#   I want to identify official posts from administrators
#   So that I can distinguish authoritative information from user-generated content

#   Background:
#     Given I am a registered GOROLL user
#     And I am logged into the application

#   Scenario: View admin post
#     Given I am viewing the community page
#     When I see a post marked as admin post
#     Then the post should have a special indicator showing it's from an admin
#     And the post should be visually distinguished from regular user posts

Feature: Community Post Navigation
  As a GOROLL application user
  I want to navigate easily between community views
  So that I can efficiently browse accessibility information

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: Navigate back from post detail
    Given I am viewing a post detail page
    When I tap the back button
    Then I should return to the previous community page
    And my previous scroll position should be maintained if applicable

  Scenario: Navigate to user profile from post
    Given I am viewing a post detail page
    When I tap on the author's username or avatar
    Then I should be navigated to the author's profile page
    And I should see the author's profile information

Feature: Community Post Loading States
  As a GOROLL application user
  I want to see appropriate loading indicators
  So that I know the app is working when content is being fetched

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: Loading post detail
    Given I tap on a post to view its details
    When the post detail is loading
    Then I should see a loading indicator
    And placeholder content should be displayed
    When the post loads successfully
    Then the loading indicator should disappear
    And the actual post content should be displayed

  Scenario: Post not found
    Given I try to access a post that doesn't exist
    When the page loads
    Then I should see a "post not found" message
    And I should have an option to return to the community page

Feature: Community Multi-language Support
  As a GOROLL application user
  I want to view community content in my preferred language
  So that I can understand and engage with content effectively

  Background:
    Given I am a registered GOROLL user
    And I am logged into the application

  Scenario: View community in English
    Given I have set my language preference to English
    When I view community posts and interface elements
    Then all text should be displayed in English

  Scenario: View community in Thai
    Given I have set my language preference to Thai
    When I view community posts and interface elements
    Then all interface text should be displayed in Thai
    And post content should remain in the original language posted by users