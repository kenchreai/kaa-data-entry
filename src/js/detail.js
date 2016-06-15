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
        var hyperlinkedProperties = ['Link',
                                     'Photograph',
                                     '3D Model',
                                     'Broader',
                                     'Has Part',
                                     'Has logical part',
                                     'Has physical part',
                                     'In excavation trench',
                                     'Is Part Of',
                                     'Logical part of',
                                     'Material',
                                     'Modern chronology',
                                     'Name',
                                     'Narrower',
                                     'Next',
                                     'On notebook page',
                                     'Physical part of',
                                     'Published catalog entry',
                                     'Same as',
                                     'VIAF Id']; 

        $('#add-btn').click(addEntry);
        $('#resource-title').text(resourceTitle).attr('href', 'http://kenchreai.org/kaa/' + resourceTitle);
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
          var label = getDescriptorLabel(e.target.value);
          if (label === "Not before (date)" || label === "Not after (date)") {
            input.attr('type', 'date');
          } else input.attr('type', 'text');
          if (label === 'Description') {
            vex.dialog.buttons.YES.text = 'Save';
            vex.dialog.open({
              message: null,
              input: '<div class="textbox-field-wrapper">' +
                       '<label>Add ' + label + '</label>' +
                       '<div class="textbox-wrapper">' +
                         '<textarea name="textbox"></textarea>' +
                       '</div>' +
                     '</div>',
              callback: function(data) {
                if (!!data) {
                  dbService.insert(resourceTitle, { key: e.target.value, val: data.textbox }, function(response) {
                    var elem = $('<tr><td>' + label + '</td><td class="object-value"><p>' + data.textbox + '</p></td></tr>');
                    attributeList.append(elem);
                    input.val('').removeClass('invalid').removeClass('valid');
                  });
                }
              }
            });
          }
          validate();
          handleTypeahead(type);
        });

        function loadDetail() {
          if (uris.length === 0) {
            utils.getAllUris(function(response) {
              uris = response;
              handleTypeahead();
            });
          }

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
              if (descriptors[0].indexOf('date') !== -1) {
                descriptors[2] = descriptors[1];
                descriptors[1] = new Date(descriptors[1] * 1000).toLocaleDateString();
              }
              if (hyperlinkedProperties.indexOf(descriptors[0]) !== -1) {
                if (result.o.value.search('kenchreai.org/kaa/') === -1)
                  descriptors[2] = 'http://kenchreai.org/kaa/' + result.o.value;
                else descriptors[2] = result.o.value;
              }
              var elem = $('<tr><td>' + descriptors[0] +
                           '</td><td class="object-value">' +
                           '<p class="' + hasModal(descriptors[0]) + '"' +
                           timestamp(descriptors) + '>' +
                           isLink(descriptors).opening + descriptors[1] + isLink(descriptors).closing +
                           '</p>' +
                           '<button class="button button-remove">X</button>' +
                           addModalButton(descriptors[0]) +
                           '</td></tr>');
              attributeList.append(elem);
            });

            $('.button-remove').on('click', function(e) {
              var row = $(this).parent().parent();
              var key = getFullUri($(row.children()[0]).text());
              var value = $($(this).siblings()[0]).text();
              if (getDescriptorLabel(key).indexOf('date') !== -1)
                value = $($(this).siblings()[0]).attr('timestamp');
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

            $('.button-view').on('click', function(e) {
              var row = $(this).parent().parent();
              var label = $(row.children()[0]).text();
              var content = $($(this).parent().children()[0]).text();
              vex.open({
                showCloseButton: true,
                content: '<h1>' + label + '</h1><p>' + content.replace(/\n/g, '</p><p>') + '</p>'
              });
            });


          });
        }

        function isLink(descriptors) {
          var properties = {
            opening: '',
            closing: ''
          };
          if (hyperlinkedProperties.indexOf(descriptors[0]) !== -1) {
            properties.opening = '<a target="_blank" href="' + descriptors[2] + '">';
            properties.closing = '</a>';
          }
          return properties;
        }

        function timestamp(descriptors) {
          if (descriptors[2])
            return ' timestamp="' + descriptors[2] + '"';
        }

        function hasModal(label) {
          return label === 'Description' ? ' view-button' : '';
        }

        function addModalButton(label) {
          if (label === 'Description') {
            return '<button class="button button-view">View</button>'
          } else return '';
        }

        function addEntry(e) {
          e.preventDefault();
          var key = select.val(), value = input.val(), label = getDescriptorLabel(key);
          if (input.attr('type') === 'date') value = parseInt((new Date(value).getTime() / 1000).toFixed(0));
          if (input.hasClass('invalid') && input.attr('type') !== 'date') return toastr.warning('Invalid value for ' + label);
          if (key && value) {
            dbService.insert(resourceTitle, { key: key, val: value }, function(response) {
              loadDetail();
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
        }, 150, true);

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
          if (['string', 'integer', 'float', 'boolean'].indexOf(type) == -1) {
            if (typeahead === null) {
              var options = {
                list: uris,
                maxItems: 25
              };
              typeahead = new Awesomplete(document.querySelector('#typeahead'), options);
              input.on('awesomplete-selectcomplete', validate);
            }
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
