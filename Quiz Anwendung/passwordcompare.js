function validatePassword(){
  var pass1 = document.getElementsByName("password")[0].value;
  var pass2 = document.getElementsByName("password2")[0].value;
  if (pass1 != pass2) {
      throw new error("Passwörter stimmen nicht überein");
  } 
}