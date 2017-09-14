'use strict';

$(document).ready(function () {
  //GLOBAL VARIABLES
  //HTML variables
  var $maskDiv = $('#mask');

  var $searchBarDiv = $('#searchBar');
  var $resetButton = $('#buttonLeft');
  var $submitButton = $('#buttonRight');
  var $surpriseButton = $('#buttonTop');
  var $searchFieldInput = $('#searchField');

  var $resultsDiv = $('div[id=results]');

  var $queryButtonsDiv = $('div[id="queryButtonsDiv"]');
  var $backButton = $('#backButton');
  var $nextButton = $('#nextButton');

  var $pageCounterDiv = $('#pageCounter');

  //Closure-related & Counter variables
  var hitCount = void 0;
  var offsetUserData = void 0;
  var offsetCounter = 0;

  var pageCounter = 1;

  //GLOBAL FUNCTIONS
  //ANIMATION: Raise search bar
  function searchBarDivRaise() {
    $searchBarDiv.css({
      'margin-top': '75px',
      'transition': '.5s'
    });
  }

  //ANIMATION: Lower search bar
  function searchBarDivLower() {
    $searchBarDiv.css({
      'margin-top': '300px',
      'transition': '.5s'
    });
  }

  //COUNTER: Reset page number
  function resetPageCounter() {
    pageCounter = 1;
    $pageCounterDiv.html('<span>Page ' + pageCounter + ' of 10</span>');
  }

  //COUNTER: Reset all counters
  function resetAllCounters() {
    offsetCounter = 0;
    resetPageCounter();
  }

  //AJAX: Get Wikipedia query response
  function wikiResponse(wikiData) {
    //Function variable(s)
    var _wikiResults = wikiData.query.search;
    hitCount = wikiData.query.searchinfo.totalhits;

    //Clear results div
    $resultsDiv.html('');

    //LOOP: Repopulate results div
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _wikiResults[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var result = _step.value;

        //Loop variables(s)
        var _wikiPageTitle = result.title.replace(" ", "_");

        //Append results to results div
        $resultsDiv.append('<div class=\'resultBox\' col-xs-12\'><a href=\'https://en.wikipedia.org/wiki/' + _wikiPageTitle + '\' target=\'_blank\'><h4>' + result.title + '</h4><p>' + result.snippet + '...</p></a></div>');
      }

      //MULTIPLE STATEMENTS
      //STATEMENT: If AJAX request returns no search hits...
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (hitCount === 0) {
      //Notify user
      $resultsDiv.append('<span>There are no search results.</span>');

      //Disable 'Next' button
      $nextButton.attr('disabled', true);

      //STATMENT: Else if AJAX request returns 10 or fewer search hits...
    } else if (hitCount <= 10) {
      //Notify user
      $resultsDiv.append('<span>There are no more search results.</span>');

      //STATEMENT: Else there are at least 11 search hits
    } else {
      //Enable 'Next' button
      $nextButton.attr('disabled', false);

      //STATEMENT: If current page is page 10...
      if (offsetCounter > 80) {
        //Disable 'Next' button
        $nextButton.attr('disabled', true);
      }

      //STATEMENT: If current page has 10 or fewer additional hits to offer...
      if (hitCount <= offsetCounter + 10) {
        //Notify user
        $resultsDiv.append('<span>There are no more search results.</span>');

        //Disable 'Next' button
        $nextButton.attr('disabled', true);
      }
    }

    //Hide loading mask
    $maskDiv.fadeOut(200);
  }

  //AJAX (DIRECT): Get Random Wikipedia page
  function surpriseAJAXRequest() {
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      url: 'https://en.wikipedia.org/w/api.php?action=query&list=random&format=json',
      success: surpriseWikiResponse
    });
  }

  //AJAX: Verify Random Wikipedia page
  function surpriseWikiResponse(surpriseWikiData) {
    //Function variable(s)
    var _surpriseWikiResults = surpriseWikiData.query.random[0].title;
    var _surpriseWikiPageTitle = _surpriseWikiResults.replace(" ", "_");

    //MULTIPLE STATEMENTS
    //STATEMENT: If the random page returned includes one or more of these in the title...
    if (_surpriseWikiPageTitle.startsWith("Category:") || _surpriseWikiPageTitle.startsWith("File:") || _surpriseWikiPageTitle.startsWith("Portal:") || _surpriseWikiPageTitle.startsWith("Talk:") || _surpriseWikiPageTitle.startsWith("Template:") || _surpriseWikiPageTitle.startsWith("User:") || _surpriseWikiPageTitle.startsWith("Wikipedia:") || _surpriseWikiPageTitle.includes("(disambiguation)") || _surpriseWikiPageTitle.includes("_talk:")) {
      //Resend AJAX request
      surpriseAJAXRequest();

      //STATEMENT: Else returned page is valid
    } else {
      //Open random Wikipedia page in new window
      window.open('https://en.wikipedia.org/wiki/' + _surpriseWikiPageTitle);

      //Hide loading mask
      $maskDiv.fadeOut(200);
    }
  }

  //CLICK & ENTER FUNCTIONS
  //ENTER: Trigger 'Submit' button event
  $searchFieldInput.on('keydown', function (evt) {
    //STATEMENT: Trigger 'submit' button event if 'Enter' key is pressed
    if (evt.which === 13) {
      $submitButton.click();
    } // if statement
  }); // .on()

  //CLICK: 'Submit' button event
  $submitButton.on('click', function () {
    //MULTIPLE STATEMENTS
    //STATEMENT: If search field is empty...
    if ($.trim($searchFieldInput.val()) === "") {
      alert('Please enter search term(s) before pressing submit.');

      //STATEMENT: Else search field has valid text
    } else {
      //Function variable(s)
      var _userData = $searchFieldInput.val();
      var _wikiURL = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + _userData + '&srwhat=text&srprop=timestamp|snippet&sroffset=0&continue=&format=json';

      //Global variable redeclaration(s)
      offsetUserData = _userData;

      //Show loading mask
      $maskDiv.fadeIn(200);

      //CSS alterations
      $maskDiv.css({
        'display': 'block'
      });
      $queryButtonsDiv.children().children().children().css({
        'display': 'inline-block'
      });
      $pageCounterDiv.css({
        'display': 'block'
      });
      searchBarDivRaise();

      //Reset counters
      resetAllCounters();

      //Disable 'Back' button
      $backButton.attr('disabled', true);

      //Enable 'reset' button
      $resetButton.attr("disabled", false);

      //AJAX request ('Submit')
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        url: _wikiURL,
        data: _userData,
        success: wikiResponse
      }); // $.ajax()
    } // if else statement
  }); // .on()

  //CLICK: 'Surprise' button event
  $surpriseButton.on('click', function () {
    //Show loading mask
    $maskDiv.fadeIn(200);

    //AJAX request ('Surprise')
    surpriseAJAXRequest();
  }); // .on()

  //CLICK: 'Reset' button event
  $resetButton.on('click', function () {
    //Clear search field
    $searchFieldInput.val("");

    //Clear results div
    $resultsDiv.html('');

    //CSS alterations
    $queryButtonsDiv.children().children().children().css({
      'display': 'none'
    });
    $pageCounterDiv.css({
      'display': 'none'
    });
    searchBarDivLower();

    //Reset counters
    resetAllCounters();

    //Disable 'reset' button
    $(this).attr("disabled", true);

    //Disable 'Back'/'Next' buttons
    $backButton.attr('disabled', true);
    $nextButton.attr('disabled', true);
  }); // .on()

  //CLICK: 'Back'/'Next' button event
  $queryButtonsDiv.children().on('click', function (evt) {

    //NOTE: 'Function variable(s)' are declared below the loop in this .on()
    //       event only because the value of the _offsetWikiURL variable is
    //       dependent on the result of the loop.

    //MULTIPLE STATEMENTS
    //STATEMENT: If 'Back' button pressed...
    if (evt.target.id === 'backButton') {
      //Reduce counters by one step
      pageCounter -= 1;
      offsetCounter -= 10;

      //STATEMENT: If current page is now page 1...
      if (offsetCounter === 0) {
        $backButton.attr("disabled", true);
      }

      //STATEMENT: Else 'Next' button has been pressed
    } else {
      //Increase counters by one step
      pageCounter += 1;
      offsetCounter += 10;

      //Enable 'Back' button
      $backButton.attr("disabled", false);
    }

    //Function variable(s)
    var _offsetWikiURL = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + offsetUserData + '&srwhat=text&srprop=timestamp|snippet&sroffset=' + offsetCounter + '&continue=&format=json';

    //Show loading mask
    $maskDiv.fadeIn(200);

    //Display current page number
    $pageCounterDiv.html('<span>Page ' + pageCounter + ' of 10</span>');

    //AJAX request ('Back'/'Next')
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      url: _offsetWikiURL,
      data: offsetUserData,
      success: wikiResponse
    }); // $.ajax()
  }); // .on()
}); // .ready()