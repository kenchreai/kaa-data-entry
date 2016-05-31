;(function() {
  var DetailPage = (function() {
    return function(urlService, dbService, utils) {
      $(document).ready(function() {

        var attributeList = $('#attribute-list tbody');
        var resourceTitle = urlService.getHash('/detail/');
        var newData = [];

        $('#add-btn').click(addEntry);
        $('#resource-title').text('Details for ' + resourceTitle);
        $('title').text('Details - ' + resourceTitle);

        var dropDown = $('#key-value-pairs select');
        var descriptors = [];

        utils.getDescriptors(function(response) {
          descriptors = response;
          response.forEach(function(descriptor) {
            dropDown.append($('<option value="' + descriptor.s.value +
                              '">' + descriptor.label.value + '</option>'));
          });
        });

        dropDown.on('change', function(e) {
          var type = utils.getType(e.target.value);
          $('input[name="value"]').attr('field-type', type);
          validate();
        });

        function loadDetail() {
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
                dbService.deleteAttribute(resourceTitle,
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
          var select = $('select[name="key"]');
          var input = $('input[name="value"]');
          if (input.hasClass('invalid')) return;

          var key = select.val();
          var value = input.val();
          var label = getDescriptorLabel(key);

          if (key && value) {
            dbService.insert(resourceTitle, { key: key, val: value }, function(response) {
              var elem = $('<tr><td>' + label + '</td><td class="object-value">' + value + '</td></tr>');
              attributeList.append(elem);
              newData.push({ key: key, value: value });
              input.val('');
            });
          }
        }

        var validate = utils.debounce(function(e) {
          var type, val, elem;
          try {
            type = e.target.attributes['field-type'].nodeValue;
            val = e.target.value;
            elem = $(this);
          } catch(e) {
            elem = $('input[name="value"]');
            type = elem.attr('field-type');
            val = elem.val();
          }
          var valid = utils.validate(type, val);
          if (!!valid) {
            elem.addClass('valid');
            elem.removeClass('invalid');
          } else {
            elem.addClass('invalid');
            elem.removeClass('valid');
          }
          if (!val) {
            elem.removeClass('valid');
            elem.removeClass('invalid');
          }
        }, 250, true);

        $('input[name="value"]').on('keyup', validate);

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

        loadDetail();
      });
    };
  })();

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DetailPage;
  else
    window.DetailPage = DetailPage;
})();
