var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var _ = require('cheerio/node_modules/lodash');

var url = "https://en.wikipedia.org/wiki/List_of_English_terms_of_venery,_by_animal";

// GET page
request(url, function (error, response, body) {

  // if no errors
  if (!error && response.statusCode === 200) {

    // load the body
    var $ = cheerio.load(body);

    // create initial var + empty obj w/ array
    var animal;
    var animal_data = {
      data_source: url,
      list_of_animals: []
    };

    // loop over the table rows
    $('table.wikitable tr').each(function(i, el) {

      // initial var
      var noun;

      // save ref to cells
      var cells = $(this).children('td');

      // check row length
      var row_length = cells.length;

      // deal with colspan garb
      if (row_length === 4) {
        animal = $(cells[0]).text();
        noun = $(cells[1]).text();
      } else if (row_length === 3) {
        // keeps previous ref to "animal"
        noun = $(cells[0]).text();
      }

      // filter out first pass + letter headers
      if (animal && noun && $(cells[1]).text().indexOf("!") < 0) {

        // check if object with this animal already exists in the array
        var matching_animal = _.find(animal_data.list_of_animals, _.matchesProperty('animal', animal));        

        if (matching_animal) {
          matching_animal.nouns.push(noun);
        } else {
          animal_data.list_of_animals.push({animal: animal, nouns: [noun]});
        }
      }

    }); // end loop

    // dump to file
    fs.writeFile('list-of-animal-venery.json', JSON.stringify(animal_data), function (err) {
      if (err) throw err;
      console.log('\nWrote', animal_data.list_of_animals.length, 'records  \\o/');
    });

  } // if (response === 200)
});
