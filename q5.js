var q5 = function(){
  var q5_ctor = function(){
    this.etc = {
      data_source: null,
    };
    this.tmp = {
      current_data: null,
      phase: 0,
      mode : 0,
      run_state: 0,
    };
  };
  q5_ctor.prototype = {
    run: function(){
      console.log('run begin');
      if(this.tmp.phase < 1000){
        this.initialize();
        return;
      }
      switch(this.tmp.mode){
      default:
        this.run_extreme();
      }
    },
    run_extreme: function(){
      console.log('run_extreme begin');
      var p = document.getElementById('q5');
      switch(this.tmp.run_state){
      case 40:
        // game over
        var gameover = document.createElement('p');
        gameover.innerHTML = 'Game Over; (Press &lt;R&gt; to restart!)';
        p.appendChild(gameover);
      case 30:
        // extreme clear
        console.log('run_extreme clear');
        var gameover = document.createElement('p');
        gameover.innerHTML = 'Game Clear!!; (Press &lt;R&gt; to restart!)';
        break;
      case 20:
        // 答え合わせ
        //var form = document.getElementsByClassName('answers', p)[0];
        //form.removeEventListener();
        var hit = false;
        var as = document.getElementsByName('answer', p);
        for(var key in as){
          var e = as[key];
          console.log(e.value);
          if(e.value === this.tmp.current_data.as[0]){
            e.className += 'answer_hit';
            if(e.checked === true)
              hit = true;
          }else{
            e.className += 'answer_unhit';
          }
        }
        if(hit){
          var m = document.createElement('p');
          m.innerHTML = 'Good!; (Press &lt;ENTER&gt; to next!)';
          m.style.color = 'green';
          p.appendChild(m);
          this.tmp.run_state = 10;
        }else{
          var m = document.createElement('p');
          m.innerHTML = 'Oops! the answer is not correct, retry one more set!';
          m.style.color = 'green';
          this.tmp.run_state = 40;
        }
        break;
      case 10:
        // 出題
        if(this.tmp.sequence.length === 0){
          this.tmp.run_state = 30;
          return;
        }
        var c = this.tmp.current_data = this.tmp.data[this.tmp.sequence.pop()];
        var c_as_key = [0,1,2,3,4];
        c_as_key.shuffle();
        var form = document.createElement('form');
        for(var key = 0; key < 5; ++key){
          var a = c.as[c_as_key[key]];
          var input = document.createElement('input');
          input.setAttribute('type','radio');
          input.setAttribute('value',a);
          input.setAttribute('name', 'answer');
          if(key === 0)
            input.setAttribute('checked', 'checked');
          var span = document.createElement('span');
          span.innerHTML = a;
          form.appendChild(input);
          form.appendChild(span);
          form.appendChild(document.createElement('br'));
        }
        form.className = 'answers';
        var keydown = function(e){
          switch(e.keyCode){
            case 13:
              g_q5.run_extreme();
              console.log(e);
              this.removeEventListener('keydown', arguments.callee);
              break;
          }
        };
        //fa.target = this;
        form.addEventListener('keydown',keydown,true);
        var send = document.createElement('input');
        send.setAttribute('type','submit');
        var question = document.createElement('p');
        question.innerHTML = c.q;
        question.className = 'question'
        var category = document.createElement('p');
        category.innerHTML = '(category: ' + c.c + ')';
        category.className = 'category';
        var info = document.createElement('p');
        info.innerHTML = '(extreme mode; クリアまであと ' + this.tmp.sequence.length + ' 問)';
        while(p.childNodes.length)
          p.removeChild(p.childNodes.item(0));
        p.appendChild(question);
        p.appendChild(category);
        p.appendChild(form);
        p.appendChild(info);
        form.childNodes.item(0).focus();
        this.tmp.run_state = 20;
        break;
      case 0:
      default:
        // 初期化
        console.log('run_extreme initialize');
        var seq = [];
        for(var n = 0; n < this.tmp.data.length; ++n)
          seq.push(n);
        seq.shuffle();
        this.tmp.sequence = seq;
        console.log(seq);
        this.tmp.run_state = 10;
        this.run_extreme();
      }
      console.log('run_extreme end');
    },
    initialize: function(){
      console.log('initialize begin');
      this.tmp.run_state = 0;
      this.load_data_source();
      window.addEventListener('keydown',function(e){
        if(e.keyCode === 82){
          g_q5.tmp.run_state = 0;
          g_q5.run();
        }
      });
      console.log('initialize exit');
    },
    load_data_source: function(){
      console.log('load_data_source begin');
      var q = new google.visualization.Query(
        'http://spreadsheets.google.com/tq?key='
        + this.etc.data_source.key
      );
      var f = function(a){
        this.target.load_data_source_callback(a);
      };
      f.target = this;
      q.send(f);
      console.log('load_data_source exit');
    },
    load_data_source_callback: function(r){
      console.log('load_data_source_callback begin');
      var data = r.getDataTable();
      this.tmp.data = [];
      for(
        var row = 1;
        row < data.getNumberOfRows();
        ++row
      ){
        var col = 0;
        var c = {};
        c.q = data.getValue(row, col++);
        c.as = [];
        do
          c.as.push(data.getValue(row, col++));
        while(col < 6);
        c.c = data.getValue(row, col);
        this.tmp.data.push(c);
      }
      console.log(this.tmp.data);
      this.tmp.phase = 1000;
      this.run();
    },
  };
  return q5_ctor;
}();

var q5_main = function(){
  console.log('q5_main begin');
  var a = new q5();
  // global registration
  g_q5 = a;
  a.etc.data_source = {
    type: 'GoogleDocs/spreadsheets',
    key : '0As7NXUDzM875dFpmbUNZUDV2OVhvR043aENHa1l6T0E',
  };
  console.log('q5_main check1');
  a.run();
};

google.setOnLoadCallback(q5_main);

// ref: http://la.ma.la/blog/diary_200608300350.htm
Array.prototype.shuffle = function() {
  var i = this.length;
  while(i){
    var j = Math.floor(Math.random()*i);
    var t = this[--i];
    this[i] = this[j];
    this[j] = t;
  }
  return this;
}

