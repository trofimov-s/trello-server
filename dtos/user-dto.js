module.exports = class UserDto {
  id;
  email;
  fullname;

  constructor(model) {
    this.id = model._id;
    this.email = model.email;
    this.fullname = model.fullname;
  }
};
