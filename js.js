///////////////////////////////////////////////////
/// Battleship game. Developer: Evgenia Grigorieva ///
///////////////////////////////////////////////////


var Rank_ = 10;
var Switch = true;
var IfWin = false;
var Cross = new Array(-1,1);

var Username = 'Captain Vrung-Vrong';
var Hardness, Compname;

// Here we will store the number of sunk ships
var allships_user = new Array(0,0,0,0);
var allships_comp = new Array(0,0,0,0);


/* preparatory stage*/

// creating tables...
var Matrix_comp = createMatrix(Rank_,0); // matrix of comp ships
var Matrix_user = createMatrix(Rank_,0); // the matrix of the user's ships
var Matrix_user_map = createMatrix(Rank_,'') // the matrix that the computer will build based on the results of its own attacks


function set_cn(vl) { // the names depending on the complexity
	switch(vl) { 
		case "0": { Compname = 'Pinocchio'; break; }
		case "1": { Compname = 'Harry Potter'; break; }
		case "2": { Compname = 'Sherlock Holmes'; break; }
		case "3": { Compname = 'Oracle of the Prophetic Palaceв'; break; }
	} 
}

function comeon() { // begin

	place_ships(Matrix_comp); // arrange the ships of the computer
	place_ships(Matrix_user); // place the user's ships
	show_left() // show ships number

	$('#comp .cell').click(function(){user_acts(this.id)})
					.hover(function(){cOver(this)},function(){cOut(this)})	
					
	$('#hi').hide();
	$('#game').fadeIn('slow');
	if ($('#user_name').val()!='') { Username = $('#user_name').val() }	
	$('#dv_un').html(Username)
	$('#whosturn').html(Username); // the user always goes first
	
	Hardness = $('input[name=ifhard]:checked').val(); set_cn(Hardness);
	$('#dv_cn').html(Compname)

}



function createMatrix(x,vl) { // template for creating a matrix with a specified standard value
	var arr = new Array(x)
	for (var i=0; i<x; i++) {
		arr[i] = new Array(x)
		for (var j=0; j<x; j++) {
			arr[i][j] = vl;
		}
	}
	return arr
}

function place_ships(arr) {

	var k
	for (var p=4; p>0; p--) { // р - responsible for decking
		k = 0
		while (k<5-p) {	// к - responsible for count
			var x = rand(Rank_-p+1); y = rand(Rank_-p+1);
			
			var z = 10 // store the checksum here
			if (rand(2)>0) { z = place_ship_horis(arr,x,y,p) } else { z = place_ship_vert(arr,x,y,p) }		
			if (z == 0 ) { k++ }
		}
	}
	
	// show the user his ships and the opponent's field
	var s1 = ""; var s2 = ""
	for (var i=0; i<Rank_; i++) {
		for (var j=0; j<Rank_; j++) {
			s1 += "<div id='c_c_"+i+'_'+j+"' class='cell'></div>"
			s2 += "<div id='c_u_"+i+'_'+j+"' class='cell "+set_class_user(Matrix_user[i][j])+"'></div>"
		}
	}
	$('#comp').html(s1)
	$('#user').html(s2)
}

function place_ship_horis(arr,x,y,p) { // placing the ships horizontally
	var z = 0
	for (var i=-1; i<2; i++) {
		for (var j=-1; j<p+1; j++) {
			z += safe_check(arr,x+i,y+j,0)	// check that all fit
	}}
	if (z==0) {
		for (var i=0; i<p; i++) {arr[x][y+i] = 1;}		// saving to the array
	} return z
}

function place_ship_vert(arr,x,y,p) { // placing the ships vertically
	var z = 0
	for (var i=-1; i<p+1; i++) {
		for (var j=-1; j<2; j++) {
			z += safe_check(arr,x+i,y+j,0)			
	}}
	if (z==0) {
		for (var i=0; i<p; i++) {arr[x+i][y] = 1;}		
	} return z	
}

function set_class_user(vl) { // placing the user's ships
	var res = ''
	if (vl==1) { res = 'ship' }
	return res;
}

/* preparation step */


/* system functions begin */

function showlog(s,cls) { // logging
	var dt = new Date();
	$('#actions').prepend("<p class='"+cls+"'>["+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds()+'] '+s+"</p>")
}

function rand(x) {
	return Math.floor(Math.random()*x) // integers on the interval [0..x-1]
}

function safe_check(arr,x,y,init) { // secure value checking so as not to go outside the array
	var res = init
	if (0<=x&&x<=9&&0<=y&&y<=9) { res = arr[x][y] }
	return res
}

function show_left() { // number of ships left
	var s1 = ''; var s2 = '';
	for (var i=0; i<4; i++) {
		s1 += parseInt(i+1)+'-decked: <b>'+parseInt(4-i-allships_user[i])+'</b><br/>'
		s2 += parseInt(i+1)+'-decked: <b>'+parseInt(4-i-allships_comp[i])+'</b><br/>'
	}	$('#comps_left').html(s1); $('#users_left').html(s2); 
}

function show_done(i,j,who) { // show to the user what is happening
	var s = (who=='comp' ? 'u':'c')
	$('#c_'+s+'_'+i+'_'+j).removeClass('ship').removeClass('damaged').addClass('done')
	$('#c_'+s+'_'+i+'_'+j).html('X')		
}

function sum_dones(arr) {return arr[0]+arr[1]+arr[2]+arr[3]}
function cOver(el){$(el).addClass('cell_over')}
function cOut(el) {$(el).removeClass('cell_over')}
function who_is(who) {return who=='comp'?Compname:Username}

/* system functions end */


/* basic algorythmes begin */

function check_ifship(cid) { // check, hitted of missed

	var x = cid.split('_')[2]; var y = cid.split('_')[3]
	if (Matrix_comp[x][y]==1) {	// if there is a ship in this place
		Matrix_comp[x][y] = 2 // check the hit
		//$('#c_c_'+x+'_'+y).html(2)
		$('#c_c_'+x+'_'+y).addClass('damaged')
		showlog(Username +' hits the target! ('+x+','+y+')','user')
		check_ifship_done(Matrix_comp,x,y,'user') // check, was hitted or destroyed
		
	} else { // if missed, then we log and pass the turn.
		showlog(Username +' misses','user')
		$('#c_c_'+x+'_'+y).html('•')
		$('#c_c_'+x+'_'+y).removeClass('ship').addClass('miss');
		comp_acts()
	}
}

function check_ifship_done(arr,x,y,who) { // checking whether the ship was hitted or destroyed

	var z = 0;	var t = 0;
	var x1 = x; var y1 = y; 
	var x2 = x-1; var y2 = y-1
	// check the X-plus
	while(safe_check(arr,x1,y,0)>0) {	x1++; t++; }
	// check the X-minus
	while(safe_check(arr,x2,y,0)>0) {	x2--; t++; };
	// check the Y-plus
	while(safe_check(arr,x,y1,0)>0) {	y1++; t++; }; 
	// check the Y-minus
	while(safe_check(arr,x,y2,0)>0) {	y2--; t++; };;
	t--; // the final deck was calculated
	
	var done = true;	
	
	for (var i=x2+1; i<x1; i++) { 
		for (var j=y2+1; j<y1; j++) { 
			if (arr[i][j]==1) { done = false; break; }
	}}	
	
	if (done) { // if destroyed
		showlog(who_is(who)+ " destroys the enemy's ship ('+t+'-decked)",'user')
		
		for (var i=x2+1; i<x1; i++) { 
			for (var j=y2+1; j<y1; j++) {
			
				show_done(i,j,who) // show the user what is happening
		
				if (who == 'comp') {
					Matrix_user_map[i][j] = 2 // definitely destroyed, noted
					
					// we hit the border with zeros so as not to shoot	
					for (var i1=0; i1<2; i1++) {
						try { if (Matrix_user_map[i+Cross[i1]][j]=='') {Matrix_user_map[i+Cross[i1]][j] = -1 }} catch(err) {}
					}
					for (var i1=0; i1<2; i1++) {
						try { if (Matrix_user_map[i][j+Cross[i1]]=='') {Matrix_user_map[i][j+Cross[i1]] = -1 }} catch(err) {}
					}
				}				
			}
		}
	
	var ash = eval('allships_'+who)
	ash[parseInt(t-1)]++
	
	show_left()	
	
	if (sum_dones(ash)>9) { alert(who_is(who) +' won. Thanks for playing, it was great!'); IfWin = true; $('#comp .cell').unbind('click').unbind('mouseenter mouseleave'); }
	
	}	
}

/* basic algorythmes end */


/* computer + AI algorithms begin */

function fire() {
	var x,y, ra, target, magic;

	switch(Hardness) {
		case '0': { // just random
			ra = random_attack(); x = ra.rx; y = ra.ry
			break;
		}
		case '1': {
			// a mixed option, we randomly determine whether to think or not to think. If we don't think, we act like Pinnochio.		
			if (rand(2)>0) {target = targeting(); x = target.tx; y = target.ty}
			else {	ra = random_attack(); x = ra.rx; y = ra.ry	}
			break;
		}
		case '2': {
			// thinking ...
			target = targeting(); x = target.tx; y = target.ty
			break;
		}
		case '3': { // another mixed option: targeting or ...
			if (rand(2)>0) {magic = puremagic(); x = magic.mx; y = magic.my} // using a little magic
			else {
			// thinking ...
			target = targeting(); x = target.tx; y = target.ty
			}
			break;
		}
	} 

	Matrix_user_map[x][y] = -1; // a turn doesn't mean a hit
	if (Matrix_user[x][y] == 1) {// if was a hit
		showlog(Compname +' hits the target','comp')
		Matrix_user[x][y] = 2
		Matrix_user_map[x][y] = 1;
		$('#c_u_'+x+'_'+y).addClass('damaged')
		//$('#c_u_'+x+'_'+y).html(2)
		try {Matrix_user_map[x-1][y-1]=-1} catch (err) {} // it can't be diagonal
		try {Matrix_user_map[x-1][y+1]=-1} catch (err) {} // it can't be diagonal
		try {Matrix_user_map[x+1][y-1]=-1} catch (err) {} // it can't be diagonal
		try {Matrix_user_map[x+1][y+1]=-1} catch (err) {} // it can't be diagonal
		
		// check if the ship is damaged or sunk
		check_ifship_done(Matrix_user,x,y,'comp')
		
		if (!IfWin) {setTimeout(function(){fire()},200)}
		
	} else {// missed
		$('#c_u_'+x+'_'+y).addClass('miss');	$('#c_u_'+x+'_'+y).html('•');		
		showlog(Compname +' misses ','comp')
	}
	
	/*
	If you need to view computer’s decisions
	var s3 = "";
	for (var i=0; i<Rank_; i++) {
		for (var j=0; j<Rank_; j++) {
			s3 += "<div id='c_um_"+i+'_'+j+"' class='cell'>"+Matrix_user_map[i][j]+"</div>"
		}
	}
	$('#user_map').innerHTML = s3		*/
	
}

function random_attack() {
	
	var x,y,z
	z = false;
	
	do {
		x = rand(Rank_); y = rand(Rank_)
		if (Matrix_user_map[x][y] == '') { z = true }
		else
		{ // if there is a number, it means that they have already hit here, this is obviously an empty area, we are looking for nearby empty ones so as not to endlessly shoot anywhere
			for (var i=x; i<Rank_; i++) {
				for (var j=y; j<Rank_; j++) {
					if (Matrix_user_map[i][j]=='') { x=i; y=j; z=true; break; }
			} if(z) { break; } }
		}
	} while (!z)
	
	return {'rx':x,'ry':y}
}

function targeting() {
	// defining a goal
	var x,y,z,h	
	
	// The main strategic firing algorithm is to search first for 4-deckers, then 3-deckers, etc. We do not search for 1-deckers using this method, it is not effective
	for (var i=3; i>-1; i--) { if(allships_comp[i]<4-i) { N=3-i; break} }
	if (N<3) {
	//showlog('Search for '+parseInt(4-N)+'-decked','comp')
	var s = ''; z = false; h=0;
		for (var i=0; i<Rank_-N; i++) {
			for (var j=h; j<Rank_-N; j=j+4-N) {
				for (var k=0; k<4-N; k++) {
					s += safe_check(Matrix_user_map,i,j+k,0)
				}	if (s=='') { x=i; y=j; z=true; break; }
				else { s = ''
				for (var k=0; k<4-N; k++) {
					s += safe_check(Matrix_user_map,i+k,j,0)
				}	if (s=='') { x=i; y=j; z=true; break; }
				} if(z) break;
			} if(z) break;
			if (h>N+1){h=0}else{h++}
		}
	}
	
	var ifdamaged = false;
	
	for (var i=0; i<Rank_; i++) {
		for (var j=0; j<Rank_; j++) {
			if (Matrix_user_map[i][j]==1) { // so, there are damaged ones - searching for
				for (var i1=0; i1<2; i1++) {
					z = safe_check(Matrix_user_map,i+Cross[i1],j,'none')
					if (z=='') { x=i+Cross[i1]; y=j; ifdamaged=true; break; }
				}
				if (!ifdamaged) {
				for (var i1=0; i1<2; i1++) {
					z = safe_check(Matrix_user_map,i,j+Cross[i1],'none')
					if (z=='') { x=i; y=j+Cross[i1]; ifdamaged=true; break; }
				} }
				if (ifdamaged) { break; }
			}				
	}}		

	if (!ifdamaged&&!z) { // there are no damaged ones, we hit at random
		z = random_attack(); x=z.rx; y=z.ry
	}
	return {'tx':x,'ty':y}
}

function puremagic() { // pure oracle magic: a look into the future
	var x,y;
	var z = false;
	for (var i=0; i<Rank_; i++) {
		for (var j=0; j<Rank_; j++) { // iterate until we find a cell with a ship
			if (Matrix_user[i][j]==1) {x=i; y=j; z=true; break;}
		} if(z) break;
	}
	return {'mx':x,'my':y}
}

/* computer + AI algorithms end */


/* next turn begin */

function user_acts(id) {	
	if (Switch&&!IfWin) {
		$('#'+id).unbind('click').unbind('mouseenter mouseleave').removeClass('cell_over')
		check_ifship(id)
	} else { alert('Please wait, Turn belongs to: '+Compname) }
}

function comp_acts() {
	Switch = false;
	$('#whosturn').html(Compname)

	setTimeout(function(){
		fire();
		Switch = true;
		$('#whosturn').html(Username)},
	500)			
}

/* next turn end */



