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
      this.run_state();
      /*
      switch(
        this.tmp.play_mode.toLowerCase()
      ){
      case 'easy':
        this.run_easy();
        break;
      case 'normal':
        this.run_normal();
        break;
      case 'extreme':
      default:
        this.run_extreme();
      }
      */
    },
    run_state: function(){
      console.log('run_state begin');
      var p = document.getElementById('q5');
      switch(this.tmp.run_state){
      case 40:
        // game over
        var gameover = document.createElement('p');
        gameover.innerHTML = 'Game Over; (Press &lt;R&gt; to restart!)';
        p.appendChild(gameover);
        for(var c_key in this.tmp.miss_categories)
        {
          var missed = document.createElement('p');
          missed.innerHTML = c_key + ': ' + this.tmp.miss_categories[c_key] + '回間違えた！'
          p.appendChild(missed);
        }
      case 30:
        // game clear
        console.log('run_state clear');
        var gameover = document.createElement('p');
        gameover.innerHTML = 'Game Clear!!; (Press &lt;R&gt; to restart!)';
        p.appendChild(gameover);
        var score = document.createElement('p');
        score.innerHTML = 'スコア: ' + (100 * this.tmp.pass / (this.tmp.pass + this.tmp.miss)).toFixed(2) + ' (=正解率)';
        p.appendChild(score);
        for(var c_key in this.tmp.miss_categories)
        {
          var missed = document.createElement('p');
          missed.innerHTML = c_key + ': ' + this.tmp.miss_categories[c_key] + '回間違えた！'
          p.appendChild(missed);
        }
        break;
      case 20:
        // 答え合わせ
        var hit = false;
        var as = document.getElementsByName('answer', p);
        for(var key in as){
          var e = as[key];
          if(e.value === this.tmp.current_data.as[0]){
            e.className += 'answer_hit';
            if(e.checked === true)
              hit = true;
          }else{
            e.className += 'answer_unhit';
          }
        }
        var m = document.createElement('p');
        if(hit){
          ++this.tmp.pass;
          m.innerHTML = 'Good! （おめでとう、正解ですよ)';
          m.style.color = 'green';
          this.tmp.run_state = 10;
        }else{
          ++this.tmp.miss;
          if(this.tmp.miss_categories[this.tmp.current_data.c])
            ++this.tmp.miss_categories[this.tmp.current_data.c];
          else
            this.tmp.miss_categories[this.tmp.current_data.c] = 1;
          m.innerHTML = 'Oops! ';
            m.style.color = 'green';
          switch(this.etc.play_mode){
          case 'easy':
            m.innerHTML += '（お手付き限界まであと∞回）'
            this.tmp.run_state = 10;
            break;
          case 'normal':
            if(this.tmp.miss <= 5)
            {
              m.innerHTML += '（お手付き限界まであと' + (5 - this.tmp.miss) + '回）'
              this.tmp.run_state = 10;
            }
            else
              this.tmp.run_state = 40;
            break;
          case 'lunatic':
            if(this.tmp.miss <= 3)
            {
              m.innerHTML += '（お手付き限界まであと' + (3 - this.tmp.miss) + '回）'
              this.tmp.run_state = 10;
            }
            else
              this.tmp.run_state = 40;
            break;
          default:
            this.tmp.run_state = 40;
          }
        }
        p.appendChild(m);
        break;
      case 10:
        // 出題
        if(this.tmp.sequence.length === 0){
          this.tmp.run_state = 30;
          return;
        }
        var c = this.tmp.current_data = this.tmp.data[this.tmp.sequence.pop()];
        var c_as_key = [1,2,3,4];
        c_as_key.shuffle();
        switch(this.etc.play_mode){
        case 'easy':
          c_as_key.pop();
          c_as_key.pop();
          break;
        }
        c_as_key.push(0);
        c_as_key.shuffle();
        var form = document.createElement('form');
        for(var key = 0; key < c_as_key.length; ++key){
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
        var fa = function(e){
          switch(e.keyCode){
            case 13:
              g_q5.run();
              console.log(e);
              this.removeEventListener('keydown', arguments.callee);
              break;
          }
        };
        var answer = document.createElement('input');
        answer.setAttribute('type', 'button');
        answer.value = 'ぽちっとな！';
        answer.addEventListener('click',function(){g_q5.run();},true);
        form.appendChild(answer);
        form.addEventListener('keydown',fa,true);
        var send = document.createElement('input');
        send.setAttribute('type','submit');
        var question = document.createElement('p');
        question.innerHTML = c.q;
        question.className = 'question'
        var category = document.createElement('p');
        category.innerHTML = '(category: ' + c.c + ')';
        category.className = 'category';
        var info = document.createElement('p');
        info.innerHTML = '(';
        switch(this.etc.play_mode){
        case 'easy':
        case 'normal':
        case 'lunatic':
          info.innerHTML += this.etc.play_mode;
          break;
        default:
          info.innerHTML += "extreme";
        }
        info.innerHTML += ' mode; 終了まであと ' + this.tmp.sequence.length + ' 問)';
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
        console.log('run_state initialize');
        var seq = [];
        for(
          var n = 0;
          n < this.tmp.data.length;
          ++n
        )
          seq.push(n);
        seq.shuffle();
        console.log(seq);
        switch(this.etc.play_mode){
        case 'easy':
          this.tmp.sequence = seq.take(20);
          break;
        case 'normal':
          this.tmp.sequence = seq.take(40);
          break;
        case 'lunatic':
          this.tmp.sequence = seq.take(60);
          break;
        default:
          this.tmp.sequence = seq;
        }
        console.log(this.tmp.sequence);
        this.tmp.run_state = 10;
        this.tmp.pass = 0;
        this.tmp.miss = 0;
        this.tmp.miss_categories = {};
        this.run();
      }
      console.log('run_state end');
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

  var configuration_from_fragment
    = function()
  {
    var a = location.hash;
    if(a.length === 0)
      return {};
    if(a[0] === '#')
      a = a.substring(1);
    var a = a.split(',');
    var r = {};
    for(var k in a){
      if(a[k].split)
        var b = a[k].split('=');
      else
        break;
      r[b[0]] = b[1];
    }
    return r;
  };
  var o = configuration_from_fragment();
  console.log('q5_main begin');
  var a = new q5();
  // global registration
  g_q5 = a;
  if(o.play_mode)
    a.etc.play_mode = o.play_mode;
  a.etc.data_source = {
    type: 'GoogleDocs/spreadsheets',
    key : '0As7NXUDzM875dFpmbUNZUDV2OVhvR043aENHa1l6T0E',
  };
  console.log('q5_main check1');
  a.run();
};

google.setOnLoadCallback(q5_main);

// ref: http://la.ma.la/blog/diary_200608300350.htm
Array.prototype.shuffle = function(){
  var i = this.length;
  while(i){
    var j = Math.floor(Math.random()*i);
    var t = this[--i];
    this[i] = this[j];
    this[j] = t;
  }
  return this;
}

Array.prototype.take = function(n){
  var r = [];
  var m = Math.min(n, this.length);
  for(var k = 0; k < m; ++k)
    r.push(this[k]);
  return r;
}

