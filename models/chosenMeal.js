var mongoose = require('mongoose');

var ChosenMealSchema = mongoose.Schema({
  date: String,
  name: String,
  children: Array
});

// Add virtual field 'id' which equals '_id'.
ChosenMealSchema.virtual('id').get(function(){
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
ChosenMealSchema.set('toObject', {
  virtuals: true
});

// Remove underscore prefix fields from output
ChosenMealSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
}

module.exports = mongoose.model('chosenMeal', ChosenMealSchema);