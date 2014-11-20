/** @jsx React.DOM */

var Dispatcher = require('../dispatcher')
var ActionTypes = require('../constants').ActionTypes

var NewsFeedMixin = {
  eagerlyFetchMoreNewsFeedItems: function(e) {
    this.setState({
      disableLoadMoreButton: true,
      page: (this.state.page || 1) + 1
    }, function() {
      var url = window.location.pathname + '?page=' + this.state.page;

      if (this.state.filter) {
        url += '&filter=' + this.state.filter;
      }

      window.xhr.get(
        url,
        this._handleMoreNewsFeedItems
      );
    }.bind(this));
  },

  initializeEagerFetching: function() {
    this.previousDistance = 0;
    this.farthestTraveled = 0;

    var self = this;
    var body = $(document);

    if (body) {
      body.scroll(function(e) {
        var distanceFromTop = document.body.scrollTop;

        if (distanceFromTop > self.farthestTraveled &&
            distanceFromTop - self.previousDistance > 3000) {
          self.eagerlyFetchMoreNewsFeedItems();
          self.previousDistance = distanceFromTop;
          self.farthestTraveled = distanceFromTop;
        }
      });
    }
  },

  _handleMoreNewsFeedItems: function(err, results) {
    if (err) {
      return console.log(err);
    }

    var data;
    try {
      data = JSON.parse(results);
    } catch (e) {
      return console.log(e);
    }

    if (data && data.items.length) {
      // TODO: this should happen in an action creator
      Dispatcher.handleServerAction({
        type: ActionTypes.NEWS_FEED_RECEIVE_RAW_ITEMS,
        data: data
      })

      this.setState(React.addons.update(
        this.state, {
          items: { $push: data.items },
          loading: { $set: false }
        }
      ));
    }
  }
};

module.exports = NewsFeedMixin;