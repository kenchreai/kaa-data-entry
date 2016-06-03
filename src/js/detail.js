;(function() {
  var DetailPage = (function() {
    return function(urlService, dbService, utils) {
      $(document).ready(function() {

        var attributeList = $('#attribute-list tbody');
        var resourceTitle = urlService.getHash('/detail/');
        var descriptors = [];
        var uris = [];
        var typeahead = null;
        var dropDown = $('#key-value-pairs select');
        var input = $('input[name="value"]');
        var select = $('select[name="key"]');

        $('#add-btn').click(addEntry);
        $('#resource-title').text('Details for ' + resourceTitle);
        $('title').text('Details - ' + resourceTitle);
        input.bind('input', function() { validate(); });

        utils.getDescriptors(function(response) {
          descriptors = response;
          response.forEach(function(descriptor) {
            dropDown.append($('<option value="' + descriptor.s.value +
                              '">' + descriptor.label.value + '</option>'));
          });
          input.attr('field-type', utils.getType(dropDown.val()));
        });

        dropDown.on('change', function(e) {
          var type = utils.getType(e.target.value);
          input.attr('field-type', type);
          validate();
          handleTypeahead(type);
        });

        function loadDetail() {
          utils.getAllUris(function(response) {
            uris = response;
            handleTypeahead();
          });

          dbService.getDetail(resourceTitle, function(response) {
            attributeList.children().remove();
            var results = response.results.bindings;
            results.forEach(function(result) {
              var descriptors = [];
              try {
                descriptors.push(result.label.value);
              } catch(e) {
                descriptors.push(result.p.value);
              }
              descriptors.push(result.o.value);
              var elem = $('<tr><td>' + descriptors[0] + 
                           '</td><td class="object-value"><p>' + descriptors[1] + '</p>' +
                           '<button class="button button-remove">X</button></td></tr>');
              attributeList.append(elem);
            });

            $('.button-remove').on('click', function(e) {
              var row = $(this).parent().parent();
              var key = getFullUri($(row.children()[0]).text());
              var value = $($(this).siblings()[0]).text();
              var type = utils.getType(key);
              if (confirm('Delete this attribute?')) {
                dbService.deleteAttribute(
                  resourceTitle,
                  { key: key, value: value },
                  type,
                  function(response) {
                    row.remove();
                });
              }
            });
          });
        }

        function addEntry(e) {
          e.preventDefault();
          var key = select.val(), value = input.val(), label = getDescriptorLabel(key);
          if (input.hasClass('invalid')) return toastr.warning('Invalid value for ' + label);
          if (key && value) {
            dbService.insert(resourceTitle, { key: key, val: value }, function(response) {
              var elem = $('<tr><td>' + label + '</td><td class="object-value">' + value + '</td></tr>');
              attributeList.append(elem);
              input.val('').removeClass('invalid').removeClass('valid');
            });
          }
        }

        var validate = utils.debounce(function(e) {
          type = input.attr('field-type');
          val = input.val();
          var valid = utils.validate(type, val);
          if (!!typeahead) valid = uris.indexOf(val) !== -1;
          if (!!valid) {
            input.addClass('valid');
            input.removeClass('invalid');
          } else {
            input.addClass('invalid');
            input.removeClass('valid');
          }
          if (!val) {
            input.removeClass('valid');
            input.removeClass('invalid');
          }
        }, 250, true);

        function getDescriptorLabel(uri) {
          var descriptor;
          descriptors.forEach(function(desc) {
            if (desc.s.value === uri) descriptor = desc;
          });
          return descriptor.label.value;
        }

        function getFullUri(label) {
          var descriptor;
          descriptors.forEach(function(desc) {
            if (desc.label.value === label) descriptor = desc;
          });
          return descriptor.s.value;
        }

        function handleTypeahead(type) {
          if (!type) var type = input.attr('field-type');
          if (['string', 'integer', 'float', 'boolean'].indexOf(type) == -1 && typeahead === null) {
            var options = {
              list: uris,
              maxItems: 25
            };
            typeahead = new Awesomplete(document.querySelector('#typeahead'), options);
            input.on('awesomplete-selectcomplete', validate);
          } else {
            typeahead = null;
            $('ul[hidden]').remove();
          }
        }

        loadDetail();
      });
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DetailPage;
  else
    window.DetailPage = DetailPage;
})();
