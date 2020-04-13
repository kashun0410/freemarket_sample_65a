$(document).on('turbolinks:load', ()=> {
  // select形式のHTMLを作成する関数：引数（レスポンスデータ, id名の区別, 選択項目のid）
  function buildHtml(data, idName, selectId) {
    let optionHtml = selectId == 0 ? `<option id="${idName}select_default" value="">選択して下さい</option>` : ''
    data.forEach(function(child){
      let selectAttr = child.id == selectId ? `selected="selected" ` : '';
      optionHtml += `<option ${selectAttr}value="${child.id}">${child.name}</option>`;
    });
    let html = `<select class="exhibition-box__text" id="item_category_${idName}id">
                  ${optionHtml}
                </select>`
    return html;
  }

  // ancestryデータのうち特定階層のデータを抽出する関数：引数（レスポンスデータ, 抽出する階層）
  function selectData(data, depth) {
    let selectData = [];
    data.forEach(function(select){
      if (select.depth == depth) {
        selectData.push(select);
      }
    });
    return selectData;
  }

  // 編集開始時のカテゴリIDを取得
  let categoryId = $('#exh-category').val();
  if (categoryId == "") { categoryId = 0 }  // 新規出品の場合は0を入れておく

  // ロード時にカテゴリに関する情報を取得してselectタブを表示する
  $.ajax({
    url: '/items/category_initial',
    type: "GET",
    data: { init_id: categoryId },
    dataType: "json"
  })
  .done(function(data) {
    let parentId = 0, childrenId = 0, grandchildrenId = 0  // ３階層のそれぞれのIDを取得する変数
    data.forEach(function(json){
      if (json.id == categoryId) {  // レスポンスデータ（配列）から選択中のID情報を取得する
        let id_len = json.path_ids.length;
        parentId = json.path_ids[0];
        if (id_len > 1) { childrenId = json.path_ids[1]; }
        if (id_len > 2) { grandchildrenId = json.path_ids[2]; }
      }
    });
    $('#select_parent').append(buildHtml(selectData(data, 0), '', parentId));
    if (parentId != 0) {
      $('#select_children').append(buildHtml(selectData(data, 1), 'children_', childrenId));
    }
    if (childrenId != 0) {
      $('#select_grandchildren').append(buildHtml(selectData(data, 2), 'grandchildren_', grandchildrenId));
    }
  })

  // 親カテゴリの選択を行った場合の処理
  $('#select_parent').on('change', '#item_category_id', function(e) {
    let inputNum = $(this).val();
    $('#exh-category').val(inputNum);  // 選択したカテゴリを送信データ[category_id]として格納する
    $('#select_default').remove();  // "選択して下さい"のデフォルトタブを削除
    if (inputNum == "") {  // 初期項目[選択してください]をクリックした場合（整序後にこの条件は不要とする）
      $("#select_children").empty();
      $("#select_grandchildren").empty();
    } else {
      $.ajax({
        url: '/items/category_children',
        type: "GET",
        data: { parent_id: inputNum },
        dataType: "json"
      })
      .done(function(data) {
        $("#select_grandchildren").empty();
        $("#select_children").empty();
        $('#select_children').append(buildHtml(data, 'children_', 0));  // レスポンスデータからselectタブを生成
      })
    }
  }).change();

  // 子カテゴリの選択を行った場合の処理
  $('#select_children').on('change', '#item_category_children_id', function(e) {
    let inputNum = $(this).val();
    $('#exh-category').val(inputNum);
    $('#children_select_default').remove();
    if (inputNum == "") {
      $("#select_grandchildren").empty();
    } else {
      $.ajax({
        url: '/items/category_children',
        type: "GET",
        data: { parent_id: inputNum },
        dataType: "json"
      })
      .done(function(data) {
        $("#select_grandchildren").empty();
        $('#select_grandchildren').append(buildHtml(data, 'grandchildren_', 0));
      })
    }
  }).change();

  // 孫カテゴリの選択を行った場合の処理
  $('#select_grandchildren').on('change', '#item_category_grandchildren_id', function(e) {
    let inputNum = $(this).val();
    $('#exh-category').val(inputNum);
    $('#grandchildren_select_default').remove();
  }).change();
});
