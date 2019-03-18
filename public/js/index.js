/*
    Code By Ilyes CH 
    ** Celyes **
    contact : http://fb.com/celyes17
*/
jQuery(document).ready(function($){
	$(".dropdown-button").dropdown();
	$('.modal').modal();
	$(".signup-toggle").click(function(){
		$(this).hide();
		$(".signupForm").show(300);
		$(".policy").css("visibility","visible");
	});
});