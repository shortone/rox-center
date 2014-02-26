// Copyright (c) 2012-2014 Lotaris SA
//
// This file is part of ROX Center.
//
// ROX Center is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// ROX Center is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with ROX Center.  If not, see <http://www.gnu.org/licenses/>.
(function() {

  var models = App.module('models'),
      TestResultCollection = models.TestResultCollection,
      views = App.module('views');

  var ResultCard = Marionette.ItemView.extend({

    template: false,
    className: 'result',

    initialize: function() {
      this.status = this.model.status();
    },

    onRender: function() {
      this.renderStatus();
      this.renderTooltip();
    },

    renderStatus: function() {
      this.$el.removeClass('passedTest failedTest inactiveTest').addClass(this.status + 'Test');
    },

    renderTooltip: function() {
      this.$el.tooltip({
        title: I18n.t('jst.testWidgets.results.resultDescription.' + (this.model.get('passed') ? 'passed' : 'failed'), {
          time: this.humanRunAt(),
          version: this.model.get('version')
        })
      });
    },

    humanRunAt: function() {
      return Format.datetime.full(new Date(this.model.get('runAt')));
    }
  });

  App.addTestWidget('results', Marionette.CompositeView, {

    itemView: ResultCard,
    itemViewContainer: '.results',

    ui: {
      results: '.results',
      description: '.description',
      resultSelector: '.resultSelector'
    },

    collectionEvents: {
      'reset': 'updateDescription',
      'error': 'showError'
    },

    initializeWidget: function(options) {

      this.controller = options.controller;
      this.collection = new (this.buildCollectionClass())();
      this.resultSelector = new views.TestResultSelector({ controller: this.controller });

      this.listenTo(this.resultSelector, 'update', this.updateResults);

      this.listenToOnce(this.collection, 'reset', function() {
        this.ui.results.show();
        this.ui.description.show();
      });
    },

    onRender: function() {

      this.ui.results.hide();
      this.ui.description.hide();

      this.ensureResultSelectorRegion();
      this.resultSelectorRegion.show(this.resultSelector);
      this.resultSelector.trigger('start');
    },

    ensureResultSelectorRegion: function() {
      if (this.resultSelectorRegion) {
        this.resultSelectorRegion.close();
      } else {
        this.resultSelectorRegion = new Marionette.Region({ el: this.ui.resultSelector });
      }
    },

    onClose: function() {
      this.resultSelectorRegion.close();
    },

    updateResults: function(resultSelectorData) {

      var data = {
        pageSize: resultSelectorData.size,
        sort: [ 'runAt desc' ]
      };

      if (resultSelectorData.version) {
        data.version = resultSelectorData.version;
      }

      this.ui.description.next('.text-danger').remove();

      this.resultSelector.trigger('loading', true);

      this.collection.fetch({
        reset: true,
        data: data
      }).always(_.bind(this.resultSelector.trigger, this.resultSelector, 'loading', false));
    },

    showError: function() {
      $('<p class="text-danger" />').text(this.t('error')).insertAfter(this.ui.description).hide().slideDown();
    },

    updateDescription: function() {
      if (this.collection.length == 1) {
        this.ui.description.text(this.t('description', {
          count: 1,
          time: Format.datetime.long(new Date(this.collection.at(0).get('runAt')))
        }));
      } else {
        this.ui.description.text(this.t('description', {
          count: this.collection.length, // NOTE: the first element is the most recent
          start: Format.datetime.long(new Date(this.collection.at(this.collection.length - 1).get('runAt'))),
          end: Format.datetime.long(new Date(this.collection.at(0).get('runAt')))
        }));
      }
    },

    buildCollectionClass: function() {
      return TestResultCollection.extend({
        url: this.model.link('v1:testResults').get('href')
      });
    },

    // override marionette to render item views in reverse order
    appendHtml: function(compositeView, itemView, index) {
      if (compositeView.isBuffering) {
        $(compositeView.elBuffer).prepend(itemView.el);
        compositeView._bufferedChildren.push(itemView);
      } else {
        var $container = this.getItemViewContainer(compositeView);
        $container.prepend(itemView.el);
      }
    }
  });
})();
