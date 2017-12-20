/**
 * 接水果-游戏
 * User: MrCo
 * Date: 14-4-22
 * Time: 下午3:25
 * Version:1.0
 */
(function(window,undefined){
    /**
     * 水果游戏初始化对象
     */
    var fruitGame = function(args){
        /*水果类型*/
        this.FruitList = [
            { ID:'F1', FruitName:'桃子',Icon:'images/1.png',Cent:50 },
            { ID:'F2', FruitName:'苹果',Icon:'images/2.png',Cent:50 },
            { ID:'F3', FruitName:'梨子',Icon:'images/3.png',Cent:50 },
            { ID:'F4', FruitName:'西红柿',Icon:'images/4.png',Cent:30 },
            { ID:'F5', FruitName:'香蕉',Icon:'images/5.png',Cent:30 },
            { ID:'F6', FruitName:'芒果',Icon:'images/6.png',Cent:50 },
            { ID:'F7', FruitName:'橘子',Icon:'images/7.png',Cent:30 },
            { ID:'F8', FruitName:'杏子',Icon:'images/8.png',Cent:20 },
            { ID:'F9', FruitName:'草莓',Icon:'images/9.png',Cent:10 },
            { ID:'F10', FruitName:'樱桃',Icon:'images/10.png',Cent:10 },
            { ID:'F11', FruitName:'柠檬',Icon:'images/11.png',Cent:30 },
            { ID:'F12', FruitName:'西瓜',Icon:'images/12.png',Cent:60 },
            { ID:'F13', FruitName:'火龙果',Icon:'images/13.png',Cent:100 },
            { ID:'F14', FruitName:'菠萝',Icon:'images/14.png',Cent:80 }
        ];
        /*炸弹类型*/
        this.BombList = [
            { ID:'B1',BombName:'土雷',Icon:'images/15.png',Life:10 },
            { ID:'B2',BombName:'导弹',Icon:'images/16.png',Life:40 }
        ];
        /*关卡等级*/
        this.LevelList = [
            { Level:1,Cent:1000,Speed:1000 },
            { Level:2,Cent:2000,Speed:600 },
            { Level:3,Cent:6000,Speed:400 },
            { Level:4,Cent:12000,Speed:200 }
        ];
        /*生成水果炸弹的全局引用*/
        this.BuilderFruit = null;
        /*水果炸弹往下移动的全局引用*/
        this.FruitMove = null;
        /*全局参数设置*/
        this.Setting = $.extend({
            //游戏盒子
            GameBox:$('div#game_box'),
            //水果篮
            CarBox:$('div#carBox'),
            //水果篮移动像素
            CarMoveWidth:30,
            //水果篮宽度
            CarBoxWidth:$('div#carBox').width(),
            //游戏盒子宽度
            BoxWidth:400,
            //游戏盒子高度
            BoxHeight:500,
            //水果宽度
            FruitWidth:30,
            //当前总得分
            CountCent:0,
            //当前关卡级别
            LevelNum:1,
            //当前关卡级别-升级监听变量
            ListenerLevelNum:1,
            //玩家姓名
            UserName:'张三',
            //玩家总血量
            LifeSize:80,
            //是否暂停
            Pause:false,
            //是否开始
            Start:false
        },args);
    }

    /**
     * 获取游戏等级对象
     */
    fruitGame.prototype.GetLevelModel = function(level){
        var _levels = this.LevelList,
            _levelObj;
        for(var i = 0, _count = _levels.length; i < _count; i++){
            _levelObj = _levels[i];
            if(_levelObj.Level == level)
                return _levelObj;
        }
        return undefined;
    }

    /**
     * 随机获得水果类型，哈哈，有可能是炸弹
     */
    fruitGame.prototype.GetRandomFruit = function(){
       var _this = this,
           _fruitCount = 0,
           _fruitIndex = 0,
           _fruitList = _this.FruitList.concat(_this.BombList);
        _fruitCount = _fruitList.length;
        _fruitIndex = parseInt(Math.random() * _fruitCount);
        return _fruitList[_fruitIndex];
    }

    /**
     * 游戏等级监听器
     */
    fruitGame.prototype.GameLevelListener = function(){
        var _this = this,
            _countCent = _this.Setting.CountCent,
            _levelList = _this.LevelList,
            _levelObj;
        for(var i = 0,_count = _levelList.length; i < _count; i++){
            _levelObj = _levelList[i];
            if(_levelObj.Cent >= _countCent){
                if(_levelObj.Level > _this.Setting.ListenerLevelNum){
                    _this.Setting.ListenerLevelNum = _levelObj.Level;
                    _this.ShowUpgrade(_levelObj.Level);
                }
                $('#gameLevel').text(_levelObj.Level);
                _this.Setting.LevelNum = _levelObj.Level;
                break;
            }
        }
    }

    /**
     * 显示提示框,Miss,Kiss,Bomb
     * @type int miss ,kiss, bomb
     * @position object { X:0,Y:0 }
     */
    fruitGame.prototype.ShowTipBox = function(type,position){
        var _this = this,
            _tipBoxID = Math.random().toString().replace('.',''),
            _tipBox = '<i id="'+ _tipBoxID +'" class="tip_box '+ type +'" style=" left:' + position.X + 'px; top:' + position.Y + 'px;"></i>';
        _this.Setting.GameBox.append(_tipBox);
        setTimeout(function(){
            $('#' + _tipBoxID).remove();
        },300);
    }

    /**
     * 升级提示框
     * @level int 等级
     */
    fruitGame.prototype.ShowUpgrade = function(level){
        var _this = this,
            _tipBox = '<span class="upgrade_tip">第'+ level +'关,加油！</span>';
        _this.Setting.GameBox.append(_tipBox);
        setTimeout(function(){
            $('span.upgrade_tip').remove();
        },2000);
    }

    /**
     * 绑定控制水果篮的左右移动
     */
    fruitGame.prototype.BindControlMove = function(){
        var _this = this;
        $(window).keydown(function(e){
            var _code = e.keyCode;
            //左
            if(_code == 37)
                _this.CarBoxMove('left');
            //右
            if(_code == 39)
                _this.CarBoxMove('right');
        });
    }

    /**
     * 水果篮位置
     */
    fruitGame.prototype.CarBoxMove = function(action){
        var _this = this,
            _setting = _this.Setting,
            _left = _setting.CarBox.position().left;
        if(action == 'left'){
            _left = _left - _setting.CarMoveWidth;
            if(_left < 0) return;
            $('div#carBox').css({ left:_left + 'px' });
        }
        if(action == 'right'){
            if(_left >  _setting.BoxWidth - _setting.CarBoxWidth) return;
            _left = _left + _setting.CarMoveWidth;
            $('div#carBox').css({ left:_left + 'px' });
        }
    }

    /**
     * 生成水果的X位置
     */
    fruitGame.prototype.BuilderFruitPosition = function(){
        var _setting = this.Setting,
            _left = parseInt(Math.random() * _setting.BoxWidth);
        return _left > _setting.BoxWidth - _setting.FruitWidth ? _setting.BoxWidth - _setting.FruitWidth : _left;
    }

    /**
     * 控制水果下落
     */
    fruitGame.prototype.FruitDownMove = function(element){
        var _this = this,
             _setting = this.Setting;
        var _move = setInterval(function(){
            var _$element = $(element),
                 _top = _$element.position().top;
            _$element.css({ top:(_top + _setting.FruitWidth) + 'px' });
            _this.FruitPutCount(_$element,_move);
        },this.GetLevelModel(_setting.LevelNum).Speed / 2);
    }

    /**
     * 水果炸弹,血量减少
     */
    fruitGame.prototype.FruitBomb = function(life){
        var _this = this,
             _$lifeBar = $('#lifeBar'),
            _lifeSize = _$lifeBar.width();
        _lifeSize -= life;
        if(_lifeSize <= 0){
            _$lifeBar.animate({width:_lifeSize + 'px'},100,function(){
                $('div.thing').remove();
                _this.Setting.GameBox.append('<span class="game_over_tip">Game Over!</span>');
            });
            clearInterval(this.BuilderFruit);
        }else{
            _$lifeBar.animate({width:_lifeSize + 'px'},100,function(){
                if(_lifeSize <= _this.Setting.LifeSize / 1.5)
                    _$lifeBar.removeAttr('class').addClass('yellow');
                if(_lifeSize <= _this.Setting.LifeSize / 2)
                    _$lifeBar.removeAttr('class').addClass('red');
            });
        }
    }

    /**
     * 水果爆炸后,抖动屏幕
     */
    fruitGame.prototype.FruitBombShock = function(){
        var _this = this,
            _$gameBox = _this.Setting.GameBox.parent(),
            _x = _$gameBox.position().left,
            _y = _$gameBox.position().top,
            _shockWidth = 5,
            _shockHeight = 1,
            _shockCount = 0;
        var _shock = setInterval(function(){
            if(_shockCount >= 10){
                _$gameBox.css({ left:_x + 'px', top:_y + 'px'});
                clearInterval(_shock);
                return;
            }
            if(_shockCount % 2 == 0)
                _$gameBox.css({ left:_x + _shockWidth + 'px', top:_y + _shockHeight + 'px'});
            else
                _$gameBox.css({ left:_x - _shockWidth + 'px', top:_y - _shockHeight + 'px'});
            _shockCount++;
        },20);
    }

    /**
     * 计算投入到篮里的水果
     */
    fruitGame.prototype.FruitPutCount = function(element,elementMove){
        var _this = this,
            _setting = _this.Setting,
            _carBoxLeft = _setting.CarBox.position().left,
            _carBoxTop = _setting.CarBox.parent().position().top,
            _elTop = element.position().top + element.height(),
            _elLeft = element.position().left + element.width(),
            _fruitCent = parseInt(element.attr('cent') || 0),
            _life = element.attr('life');

        if(_elLeft >= _carBoxLeft && _elLeft - element.width() <= _carBoxLeft + _setting.CarBoxWidth && _elTop - 50 >= _carBoxTop){
            clearInterval(elementMove);
            element.remove();

            if(typeof _life == 'undefined'){
                //console.log('A:' + _life + ' - ' + (typeof _life == 'undefined') + ' - ' + _fruitCent);
                _setting.CountCent += _fruitCent;
                $('#gameCent').text(_setting.CountCent);
                _this.GameLevelListener();
                _this.ShowTipBox('kiss',{ X:_elLeft - _setting.FruitWidth, Y: _elTop - 30 });
            }else{
                //console.log('B:' + _life);
                _this.FruitBomb(_life);
                _this.ShowTipBox('bomb',{ X:_elLeft - _setting.FruitWidth - 20, Y: _elTop - 60 });
                _this.FruitBombShock();
            }
        }else if(_elTop - 60 > _carBoxTop){
            clearInterval(elementMove);
            element.remove();
            _this.ShowTipBox('miss',{ X:_elLeft - _setting.FruitWidth, Y: _elTop - 60 });
        }
    }

    /**
     * 开始游戏
     */
    fruitGame.prototype.Start = function(){
        var _this = this,
            _setting = this.Setting;

        _this.BindControlMove();
        _this.BuilderFruit = setInterval(function(){
            var _domDiv = document.createElement('div'),
                _fruitObj = _this.GetRandomFruit();
            _domDiv.setAttribute('class','thing');
            _domDiv.setAttribute('idx',_fruitObj.ID);
            if(_fruitObj.Life){
                _domDiv.setAttribute('life',_fruitObj.Life);
            }else{
                _domDiv.setAttribute('cent',_fruitObj.Cent);
            }
            _domDiv.setAttribute('style','left:' + _this.BuilderFruitPosition() + 'px;');
            _domDiv.innerHTML = '<img src="'+ _fruitObj.Icon +'" width="30" height="30"/>';
            _setting.GameBox.append(_domDiv);
            _this.FruitDownMove(_domDiv);
        },_this.GetLevelModel(_setting.LevelNum).Speed);
        return this;
    }

    /**
     * 游戏初始化
     */
    fruitGame.prototype.Init = function(){
        var _this = this;
        //new fruitGame().Start();
    }

    window.FruitGame = function(){
        return new fruitGame();
    }();
})(window);