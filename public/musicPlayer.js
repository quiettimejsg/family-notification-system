class MusicPlayer {
  constructor() {
    this.audioElement = new Audio();
    this.playlist = [];
    this.currentTrackIndex = -1;
    this.isPlaying = false;
    this.initElements();
    this.bindEvents();
    this.loadAudioFiles();
  }

  // 初始化DOM元素
  initElements() {
    this.playerContainer = document.getElementById('music-player');
    this.playBtn = document.getElementById('play-btn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.progressBar = document.getElementById('progress-bar');
    this.currentTimeDisplay = document.getElementById('current-time');
    this.durationDisplay = document.getElementById('duration');
    this.volumeBar = document.getElementById('volume-bar');
    this.playlistContainer = document.getElementById('audio-playlist');
  }

  // 绑定事件监听
  bindEvents() {
    if (!this.playBtn) return;

    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.prevTrack());
    this.nextBtn.addEventListener('click', () => this.nextTrack());
    this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
    this.audioElement.addEventListener('play', () => this.updateProgress());
    this.audioElement.addEventListener('playing', () => this.updateProgress());
    this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
    this.audioElement.addEventListener('loadedmetadata', () => {
      this.updateDuration();
      this.updateProgress(); // 元数据加载后立即更新进度
    });
    this.audioElement.addEventListener('ended', () => this.nextTrack());
    this.audioElement.addEventListener('error', (e) => {
      console.error('音频播放错误:', e);
      console.error('错误代码:', this.audioElement.error?.code);
    });
    this.progressBar.addEventListener('input', () => this.seek());
    this.volumeBar.addEventListener('input', () => this.setVolume());
  }

  // 加载音频文件列表
  async loadAudioFiles() {
    try {
      const response = await fetch('/api/audio-files');
      if (!response.ok) throw new Error('无法获取音频文件列表');
      this.playlist = await response.json();
      this.renderPlaylist();
      if (this.playlist.length > 0) {
        this.currentTrackIndex = 0;
        this.loadTrack(0);
      } else {
        console.log('没有找到音频文件');
      }
    } catch (err) {
      console.error('加载音频文件失败:', err);
    }
  }

  // 渲染播放列表
  renderPlaylist() {
    if (!this.playlistContainer) return;
    this.playlistContainer.innerHTML = '';

    this.playlist.forEach((track, index) => {
      const li = document.createElement('li');
      li.textContent = track.original_name;
      li.classList.toggle('active', index === this.currentTrackIndex);
      li.addEventListener('click', () => this.selectTrack(index));
      this.playlistContainer.appendChild(li);
    });
  }

  // 加载指定曲目
  loadTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    const track = this.playlist[index];
    if (!track.path) {
      console.error('音频文件路径不存在:', track);
      return;
    }
    const audioSrc = `/uploads/${track.path}`;
    console.log('加载音频文件:', audioSrc);
    this.audioElement.src = audioSrc;
    this.audioElement.load(); // 显式加载音频
    this.currentTrackIndex = index;
    this.renderPlaylist();
    document.title = `♪: ${track.original_name}`;
    // 保存播放状态并在音频可播放时恢复
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    this.playBtn.textContent = '▶';
    // 监听canplay事件，确保音频已加载
    const handleCanPlay = () => {
      console.log('音频可播放，准备播放');
      if (wasPlaying) {
        this.togglePlay();
      }
      this.audioElement.removeEventListener('canplay', handleCanPlay);
    };
    this.audioElement.addEventListener('canplay', handleCanPlay);
    // 添加加载超时处理
    setTimeout(() => {
      if (this.audioElement.readyState < 2) {
        console.error('音频加载超时:', audioSrc);
      }
    }, 5000);
  }

  // 切换播放/暂停
  togglePlay() {
    if (this.audioElement.src === '') return;

    if (this.isPlaying) {
      this.audioElement.pause();
      this.playBtn.textContent = '▶';
      this.isPlaying = false;
    } else {
      this.audioElement.play()
        .then(() => {
          this.playBtn.textContent = '⏸';
          this.isPlaying = true;
        })
        .catch(err => {
          console.error('播放失败:', err);
          console.error('错误类型:', err.name);
          console.error('错误信息:', err.message);
          this.playBtn.textContent = '播放';
          this.isPlaying = false;
        });
    }
  }

  // 上一曲
  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadTrack(this.currentTrackIndex);
    if (this.isPlaying) this.audioElement.play();
  }

  // 下一曲
  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.loadTrack(this.currentTrackIndex);
    if (this.isPlaying) this.audioElement.play();
  }

  // 更新进度条
  updateProgress() {
    // 添加调试日志
    console.log('更新进度 - currentTime:', this.audioElement.currentTime, 'duration:', this.audioElement.duration);
    if (isNaN(this.audioElement.currentTime)) {
      console.log('currentTime为NaN，无法更新进度');
      return;
    }
    const percent = !isNaN(this.audioElement.duration) ? (this.audioElement.currentTime / this.audioElement.duration) * 100 : 0;
    this.progressBar.value = percent || 0;
    const formattedTime = this.formatTime(this.audioElement.currentTime);
    this.currentTimeDisplay.textContent = formattedTime;
    console.log('更新显示时间:', formattedTime);
  }

  // 更新总时长
  updateDuration() {
    this.durationDisplay.textContent = this.formatTime(this.audioElement.duration);
  }

  // 格式化时间（秒 -> MM:SS）
  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  }

  // 进度条拖动定位
  seek() {
    if (isNaN(this.audioElement.duration)) return;
    const time = (this.progressBar.value / 100) * this.audioElement.duration;
    if (!isNaN(time)) {
      this.audioElement.currentTime = time;
    }
  }

  // 设置音量
  setVolume() {
    this.audioElement.volume = this.volumeBar.value;
  }

  // 选择播放列表中的曲目
  selectTrack(index) {
    this.loadTrack(index);
    if (!this.isPlaying) {
      this.togglePlay();
    } else {
      this.audioElement.play();
    }
  }
}

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否已有播放器容器，没有则创建
  if (!document.getElementById('music-player')) {
    const playerHTML = `
      <div id="music-player" class="music-player">
        <h2>♪</h2>
        <div class="player-controls">
          <button id="prev-btn"><</button>
          <button id="play-btn">▶</button>
          <button id="next-btn">></button>
        </div>
        <div class="progress-container">
          <span id="current-time">0:00</span>
          <input type="range" id="progress-bar" min="0" max="100" value="0">
          <span id="duration">0:00</span>
        </div>
        <div class="volume-control">
          <label for="volume-bar">🔊</label>
          <input type="range" id="volume-bar" min="0" max="1" step="0.1" value="1">
        </div>
        <div class="playlist-container">
          <h3>↹</h3>
          <ul id="audio-playlist"></ul>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', playerHTML);
  }

  // 初始化音乐播放器
  window.musicPlayer = new MusicPlayer();
});