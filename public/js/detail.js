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
            dropDown.append($('<option value="' + descriptor.label.value +
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
          dbService.getDetail(urlService.getResourceFromHash('/detail/'), function(response) {
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
                           '</td><td>' + descriptors[1] + '</td></tr>');
              attributeList.append(elem);
            });
          });
        }

        function addEntry(e) {
          e.preventDefault();
          var key = $('select[name="key"]').val();
          var value = $('input[name="value"]').val();
          if (key && value) {
            var elem = $('<tr><td>' + key + '</td><td>' + value + '</td></tr>');
            attributeList.append(elem);
            newData.push({ key: key, value: value });
            $('input[name="key"]').val('');
            $('input[name="value"]').val('');
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
