///////////////////////////////////////////////////
/// Морской бой. Разработчик: Евгения Григорьева///
///////////////////////////////////////////////////


var Rank_ = 10;
var Switch = true;
var IfWin = false;
var Cross = new Array(-1,1);

var Username = 'Капитан Врунгель';
var Hardness, Compname;

// здесь будем хранить количество потопленных кораблей
var allships_user = new Array(0,0,0,0);
var allships_comp = new Array(0,0,0,0);


/* подготовительный этап */

// создаем наши таблицы...
var Matrix_comp = createMatrix(Rank_,0); // матрица кораблей компа
var Matrix_user = createMatrix(Rank_,0); // матрица кораблей юзера
var Matrix_user_map = createMatrix(Rank_,'') // матрица, которую будет строить комп, опираясь на результаты собственных атак


function set_cn(vl) { // определяемся с именами в зависимости от сложности
	switch(vl) { 
		case "0": { Compname = 'Буратино'; break; }
		case "1": { Compname = 'Гарри Поттер'; break; }
		case "2": { Compname = 'Шерлок Холмс'; break; }
		case "3": { Compname = 'Оракул Дворца пророков'; break; }
	} 
}

function comeon() { // начали

	place_ships(Matrix_comp); // расставляем корабли компьютера
	place_ships(Matrix_user); // расставляем корабли пользователя
	show_left() // показываем, сколько кораблей

	$('#comp .cell').click(function(){user_acts(this.id)})
					.hover(function(){cOver(this)},function(){cOut(this)})	
					
	$('#hi').hide();
	$('#game').fadeIn('slow');
	if ($('#user_name').val()!='') { Username = $('#user_name').val() }	
	$('#dv_un').html(Username)
	$('#whosturn').html(Username); // первым всегда ходит пользователь - эдакий реверанс
	
	Hardness = $('input[name=ifhard]:checked').val(); set_cn(Hardness);
	$('#dv_cn').html(Compname)

}



function createMatrix(x,vl) { // шаблон создания матрицы с заданным типовым значением
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
	for (var p=4; p>0; p--) { // р - отвечает за палубность
		k = 0
		while (k<5-p) {	// к - отвечает за количество
			var x = rand(Rank_-p+1); y = rand(Rank_-p+1);
			
			var z = 10 // здесь будем хранить контрольную сумму
			if (rand(2)>0) { z = place_ship_horis(arr,x,y,p) } else { z = place_ship_vert(arr,x,y,p) }		
			if (z == 0 ) { k++ }
		}
	}
	
	// покажем пользователю его корабли и поле соперника
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

function place_ship_horis(arr,x,y,p) { // размещаем корабли горизонтально
	var z = 0
	for (var i=-1; i<2; i++) {
		for (var j=-1; j<p+1; j++) {
			z += safe_check(arr,x+i,y+j,0)	// проверяем, что умещается			
	}}
	if (z==0) {
		for (var i=0; i<p; i++) {arr[x][y+i] = 1;}		// записываем в массив	
	} return z
}

function place_ship_vert(arr,x,y,p) { // размещаем корабли вертикально
	var z = 0
	for (var i=-1; i<p+1; i++) {
		for (var j=-1; j<2; j++) {
			z += safe_check(arr,x+i,y+j,0)			
	}}
	if (z==0) {
		for (var i=0; i<p; i++) {arr[x+i][y] = 1;}		
	} return z	
}

function set_class_user(vl) { // расставляем кораблики на поле пользователя
	var res = ''
	if (vl==1) { res = 'ship' }
	return res;
}

/* /подготовительный этап */


/* системные и вспомогательные функции */

function showlog(s,cls) { // собственно, лог, чтоб знать
	var dt = new Date();
	$('#actions').prepend("<p class='"+cls+"'>["+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds()+'] '+s+"</p>")
}

function rand(x) {
	return Math.floor(Math.random()*x) // получаем целые числа на отрезке [0..x-1]
}

function safe_check(arr,x,y,init) { // защищенная проверка значений, чтобы не вылазить за пределы массива
	var res = init
	if (0<=x&&x<=9&&0<=y&&y<=9) { res = arr[x][y] }
	return res
}

function show_left() { // покажем, у кого сколько кораблей осталось
	var s1 = ''; var s2 = '';
	for (var i=0; i<4; i++) {
		s1 += parseInt(i+1)+'-палубные: <b>'+parseInt(4-i-allships_user[i])+'</b><br/>'
		s2 += parseInt(i+1)+'-палубные: <b>'+parseInt(4-i-allships_comp[i])+'</b><br/>'
	}	$('#comps_left').html(s1); $('#users_left').html(s2); 
}

function show_done(i,j,who) { // покажем пользователю, что происходит
	var s = (who=='comp' ? 'u':'c')
	$('#c_'+s+'_'+i+'_'+j).removeClass('ship').removeClass('damaged').addClass('done')
	$('#c_'+s+'_'+i+'_'+j).html('X')		
}

function sum_dones(arr) {return arr[0]+arr[1]+arr[2]+arr[3]}
function cOver(el){$(el).addClass('cell_over')}
function cOut(el) {$(el).removeClass('cell_over')}
function who_is(who) {return who=='comp'?Compname:Username}

/* /системные и вспомогательные функции */


/* базовые алгоритмы */

function check_ifship(cid) { // проверка, попали в корабль или мимо

	var x = cid.split('_')[2]; var y = cid.split('_')[3]
	if (Matrix_comp[x][y]==1) {	// если в этом месте есть корабль
		Matrix_comp[x][y] = 2 // отметили, что потопили
		//$('#c_c_'+x+'_'+y).html(2)
		$('#c_c_'+x+'_'+y).addClass('damaged')
		showlog(Username +' попадает в цель! ('+x+','+y+')','user')
		check_ifship_done(Matrix_comp,x,y,'user') // проверить, подбит или полностью утоплен
		
	} else { // если мимо, то отчитываемся и передаем ход
		showlog(Username +' стреляет мимо','user')
		$('#c_c_'+x+'_'+y).html('•')
		$('#c_c_'+x+'_'+y).removeClass('ship').addClass('miss');
		comp_acts()
	}
}

function check_ifship_done(arr,x,y,who) { // проверка, потоплен кораблен или подбит

	var z = 0;	var t = 0;
	var x1 = x; var y1 = y; 
	var x2 = x-1; var y2 = y-1
	// проверяем по иксу в плюс
	while(safe_check(arr,x1,y,0)>0) {	x1++; t++; }
	// проверяем по иксу в минус
	while(safe_check(arr,x2,y,0)>0) {	x2--; t++; };
	// проверяем по игреку в плюс
	while(safe_check(arr,x,y1,0)>0) {	y1++; t++; }; 
	// проверяем по игреку в минус
	while(safe_check(arr,x,y2,0)>0) {	y2--; t++; };;
	t--; // итоговую палубность посчитали
	
	var done = true;	
	
	for (var i=x2+1; i<x1; i++) { 
		for (var j=y2+1; j<y1; j++) { 
			if (arr[i][j]==1) { done = false; break; }
	}}	
	
	if (done) { // если подбили
		showlog(who_is(who)+ ' уничтожает корабль противника ('+t+'-палубный)','user')
		
		for (var i=x2+1; i<x1; i++) { 
			for (var j=y2+1; j<y1; j++) {
			
				show_done(i,j,who) // отобразить пользователю, что происходит
		
				if (who == 'comp') {
					Matrix_user_map[i][j] = 2 // точно убит, отметили
					
					// забиваем нулями границу, чтоб не стрелять		
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
	
	if (sum_dones(ash)>9) { alert(who_is(who) +' победил. Спасибо за игру, было здорово!'); IfWin = true; $('#comp .cell').unbind('click').unbind('mouseenter mouseleave'); }
	
	}	
}

/* /базовые алгоритмы */


/* алгоритмы компьютера +ИИ */

function fire() {
	var x,y, ra, target, magic;

	switch(Hardness) {
		case '0': { // просто рандом
			ra = random_attack(); x = ra.rx; y = ra.ry
			break;
		}
		case '1': {
			// смешанный вариант, рандомно определяем, думать или не думать. если не думать, то действуем как буратины			
			if (rand(2)>0) {target = targeting(); x = target.tx; y = target.ty}
			else {	ra = random_attack(); x = ra.rx; y = ra.ry	}
			break;
		}
		case '2': {
			// думаем...
			target = targeting(); x = target.tx; y = target.ty
			break;
		}
		case '3': { // еще смешанный вариант: таргетируем или...
			if (rand(2)>0) {magic = puremagic(); x = magic.mx; y = magic.my} // применяем магию
			else {
			// думаем...
			target = targeting(); x = target.tx; y = target.ty
			}
			break;
		}
	} 

	Matrix_user_map[x][y] = -1; // ударили - не значит, что попали
	if (Matrix_user[x][y] == 1) {// если попали
		showlog(Compname +' попадает в цель','comp')
		Matrix_user[x][y] = 2
		Matrix_user_map[x][y] = 1;
		$('#c_u_'+x+'_'+y).addClass('damaged')
		//$('#c_u_'+x+'_'+y).html(2)
		try {Matrix_user_map[x-1][y-1]=-1} catch (err) {} // по диагонали быть не может
		try {Matrix_user_map[x-1][y+1]=-1} catch (err) {} // по диагонали быть не может
		try {Matrix_user_map[x+1][y-1]=-1} catch (err) {} // по диагонали быть не может
		try {Matrix_user_map[x+1][y+1]=-1} catch (err) {} // по диагонали быть не может
		
		// проверим, корабль поврежден или потоплен
		check_ifship_done(Matrix_user,x,y,'comp')
		
		if (!IfWin) {setTimeout(function(){fire()},200)}
		
	} else {// не попали
		$('#c_u_'+x+'_'+y).addClass('miss');	$('#c_u_'+x+'_'+y).html('•');		
		showlog(Compname +' стреляет мимо','comp')
	}
	
	/*
	Если нужно посмотреть, как ходит комп
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
		{ // если число, значит, сюда уже били, это заведомо пустая область, ищем близлежащие пустые, чтоб бесконечно не палить куда попало
			for (var i=x; i<Rank_; i++) {
				for (var j=y; j<Rank_; j++) {
					if (Matrix_user_map[i][j]=='') { x=i; y=j; z=true; break; }
			} if(z) { break; } }
		}
	} while (!z)
	
	return {'rx':x,'ry':y}
}

function targeting() {
	// определяем цель
	var x,y,z,h	
	
	// Основной страт. алгоритм стрельбы: поиск сначала 4-палубных, затем 3-х и т.д. 1-палубные таким методом не ищем, не эффективно
	for (var i=3; i>-1; i--) { if(allships_comp[i]<4-i) { N=3-i; break} }
	if (N<3) {
	//showlog('Ищу '+parseInt(4-N)+'-палубные','comp')
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
			if (Matrix_user_map[i][j]==1) { // значит, есть поврежденные - ищем
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

	if (!ifdamaged&&!z) { // поврежденных нет, бьем наугад
		z = random_attack(); x=z.rx; y=z.ry
	}
	return {'tx':x,'ty':y}
}

function puremagic() { // чистая магия оракула: взгляд в будущее
	var x,y;
	var z = false;
	for (var i=0; i<Rank_; i++) {
		for (var j=0; j<Rank_; j++) { // перебираем, пока не найдем ячейку с кораблем
			if (Matrix_user[i][j]==1) {x=i; y=j; z=true; break;}
		} if(z) break;
	}
	return {'mx':x,'my':y}
}

/* алгоритмы компьютера +ИИ */


/* переход хода */

function user_acts(id) {	
	if (Switch&&!IfWin) {
		$('#'+id).unbind('click').unbind('mouseenter mouseleave').removeClass('cell_over')
		check_ifship(id)
	} else { alert('Пожалуйста, подождите, сейчас ходит '+Compname) }
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

/* /переход хода */
