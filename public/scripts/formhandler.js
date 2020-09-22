
const PSG_userName = 'cariboo';
const PSG_password = 'CAB67S';
const PSG_licenseKey = 'TT27KF71H48MYW';
const url = 'https://cors-anywhere.herokuapp.com/' + 'www.plussizingguide.com/cgi-bin/ultimate_guide_online.cgi?userName=cariboo&password=CAB67S&licenseKey=TT27KF71H48MYW';

jQuery(document).ready(function ($) {
	//populate years
	$.ajax({
		type: 'POST',
		url: url,
		success: function (html) {
			$('select[name="selectYear"]').html(html);
			$('select[name="selectYear"]').prop('disabled', false);
		}
	});

	//on year change
	$('select[name="selectYear"]').on('change', function () {
		var selectYear = $(this).val();
		if (selectYear && selectYear != 'Select Year') {
			$.ajax({
				headers: {  'Access-Control-Allow-Origin': '*' },
				type: 'POST',
				url: url,
				data: {
					'selectYear': selectYear
				},
				success: function (html) {
					$('select[name="selectMake"]').html(html).prop('disabled', false);
					//appendMakes(html);
				}
			});
		} else {
			$('select[name="selectMake"]').html('<option>Select Make</option>');
			$('select[name="selectMake"]').prop('disabled', true);
		}
		$('select[name="selectModel"]').html('<option>Select Model</option>');
		$('select[name="selectModel"]').prop('disabled', true);
		$('select[name="selectSeason"]').val("Select Season");
		$('select[name="selectSeason"]').prop('disabled', true);
		$('input[name="search"]').prop('disabled', true);
	});

	//on make change
	$('select[name="selectMake"]').on('change', function () {
		var selectYear = $('select[name="selectYear"]').val();
		var selectMake = $(this).val();
		if (selectYear && selectMake && selectMake != 'Select Make') {
			$.ajax({
				headers: {  'Access-Control-Allow-Origin': '*' },
				type: 'POST',
				datatype: 'html',
				url: url,
				data: {
					'selectMake': selectMake,
					'selectYear': selectYear
				},
				success: function (html) {
					$('select[name="selectModel"]').html(html, $('select[name="selectModel"]').prop('disabled', false));

				}
			});
		} else {
			$('select[name="selectModel"]').html('<option>Select Model</option>');
			$('select[name="selectModel"]').prop('disabled', true);
		}
		$('select[name="selectSeason"]').val('Select Season');
		$('select[name="selectSeason"]').prop('disabled', true);
		$('input[name="search"]').prop('disabled', true);
	});

	//on model change
	$('select[name="selectModel"]').on('change', function () {
		var selectYear = $('select[name="selectYear"]').val();
		var selectMake = $('select[name="selectMake"]').val();
		var selectModel = $(this).val();
		if (selectYear && selectMake && selectModel && selectModel != 'Select Model') {
			$('select[name="selectSeason"]').prop('disabled', false);
			$('input[name="search"]').prop('disabled', false);
		} else {
			$('select[name="selectSeason"]').val('Select Season');
			$('select[name="selectSeason"]').prop('disabled', true);
			$('input[name="search"]').prop('disabled', true);
		}
		$('input[name="search"]').prop('disabled', true);
	});

	//on season change 
	$('select[name="selectSeason"]').on('change', function () {
		var selectYear = $('select[name="selectYear"]').val();
		var selectMake = $('select[name="selectMake"]').val();
		var selectModel = $('select[name="selectMake"]').val();
		var selectSeason = $(this).val();
		if (selectYear && selectMake && selectModel && selectSeason && selectSeason != 'Select Season') {
			$('input[name="search"]').prop('disabled', false);
		} else {
			$('input[name="search"]').prop('disabled', true);
		}
	});


	//search action
	$('form[name="plusGuide"]').on('submit', function (e) {
		var selectYear = $('select[name="selectYear"]').val();
		var selectMake = $('select[name="selectMake"]').val();
		var selectModel = $('select[name="selectModel"]').val();
		var selectSeason = $('select[name="selectSeason"]').val();
		e.preventDefault();
		if (selectYear && selectMake && selectModel) {
			$.ajax({
				headers: {  'Access-Control-Allow-Origin': '*' },
				type: 'POST',
				datatype: 'html',
				url: url,
				data: {
					'action': 'search_tires',
					'selectModel': selectModel,
					'selectMake': selectMake,
					'selectYear': selectYear
				},
				success: function (html) {
					//serilize form data to array
					var formArr = $(html).serializeArray();
					var formObjs = {};
					//add array data to object	
					$(formArr).each(function (i, field) {
						formObjs[field.name] = field.value;
						//also save in localstorage
						localStorage.setItem(field.name, field.value);
						i++;
						if (i == formArr.length && localStorage.getItem('SEASON')) {
							redirect(formObjs);
						}
					});

					//Add season form data
					var obj = {
						'name': 'SEASON',
						'value': selectSeason
					}
					formObjs[obj.name] = obj.value;
					localStorage.setItem(obj.name, obj.value);
				}
			});
		}
	});

	function appendMakes(html) {
		var e = document.createElement('div');
		e.innerHTML = html;

		var newOpts = document.createElement('div');
		var opts = e.getElementsByTagName('option');
		//add original 
		newOpts.appendChild(opts[0]);
		for (var opt, i = 0; opt = opts[i]; i++) {
			for (var make, j = 0; make = makes[j]; j++) {
				if (opt.value.toUpperCase() == make.toUpperCase()) {
					newOpts.appendChild(opts[i]);
				}
			}
			if (i == (opts.length - 1)) {
				$('select[name="selectMake"]').html(newOpts.innerHTML, $('select[name="selectMake"]').prop('disabled', false));
			}
		}
	}

	function redirect(formObjs) {
		//https://caribootiresolution.com/category/all/filters/caryear/2020/make/bmw/model/2-series-230/
		//replace model spaces with dashes
		//var removeSpaces = formObjs['MODEL'].replace(/ /g, '-');
		console.log(formObjs);
		localStorage.setItem("formObjs", formObjs);
		//redirect page
		window.location.href = '../views/selectwheel.html';
	}
});