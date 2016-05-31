;(function() {
  var DetailPage = (function() {
    return function(urlService, dbService, constants) {
      $(document).ready(function() {

        var attributeList = $('#attribute-list tbody');
        var resourceTitle = urlService.getHash('/detail/');
        var newData = [];

        $('#add-btn').click(addEntry);
        $('#resource-title').text('Details for ' + resourceTitle);
        $('title').text('Details - ' + resourceTitle);

        var dropDown = $('#key-value-pairs select');
        var descriptors = [];

        constants.descriptors(function(response) {
          descriptors = response;
          response.forEach(function(descriptor) {
            dropDown.append($('<option value="' + descriptor.s.value +
                              '">' + descriptor.label.value + '</option>'));
          });
        });

        dropDown.on('change', function(e) {
          var label = e.target.value;
          var descriptor, type, typeValue;
          constants.dataTypes.filter(function(desc) {
            if (desc.label.value === label) {
              descriptor = desc;
              type = 'data';
            }
          });
          constants.objectTypes.filter(function(desc) {
            if (desc.label.value === label) {
              descriptor = desc;
              type = 'object';
              typeValue = 'uri';
            }
          });
          if (type === 'data') {
            typeValue = descriptor.range.value.slice(descriptor.range.value.indexOf('#') + 1);
          }
          $('input[name="value"]').attr('field-type', typeValue);
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

            $('td.object-value').hover(function() {
              $(this).addClass('hover');
            }, function() {
              $(this).removeClass('hover');
            });

            $('.button-remove').on('click', function(e) {
              var row = $(this).parent().parent();
              var key = getFullUri($(row.children()[0]).text());
              var value = $($(this).siblings()[0]).text();
              if (confirm('Delete this attribute?')) {
                dbService.deleteAttribute(resourceTitle,
                                          { key: key, value: value },
                                          function(response) {
                  row.remove();
                });
              }
            });
          });
        }

        function addEntry(e) {
          e.preventDefault();
          var key = $('select[name="key"]').val();
          var label = getDescriptorLabel(key);
          var value = $('input[name="value"]').val();
          if (key && value) {
            dbService.insert(resourceTitle, { key: key, val: value }, function(response) {
              var elem = $('<tr><td>' + label + '</td><td class="object-value">' + value + '</td></tr>');
              attributeList.append(elem);
              newData.push({ key: key, value: value });
              $('input[name="key"]').val('');
              $('input[name="value"]').val('');
            });
          }
        }

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
