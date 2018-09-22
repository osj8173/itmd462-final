var mongoose = require('mongoose');

var MenuSchema = mongoose.Schema({
  date: String,
  jstree: Array
});

// Add virtual field 'id' which equals '_id'.
MenuSchema.virtual('id').get(function(){
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
MenuSchema.set('toObject', {
  virtuals: true
});

// Remove underscore prefix fields from output
MenuSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
}

module.exports = mongoose.model('menu', MenuSchema);