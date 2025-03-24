<template>
  <div class="c-Publicity">
    <div class="publicity-content">
      <div v-if="currentMessage" class="item">
        <span class="value">
          {{ currentMessage.displayText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { conversionCategoryName } from '@/helper/index';

export default {
  name: 'Publicity',
  data() {
    return {
      currentIndex: 0,
      timer: null
    };
  },
  computed: {
    config() {
      return this.$store.state.config;
    },
    result() {
      return this.$store.state.result;
    },
    message() {
      const { result, config } = this;
      const fields = Object.keys(config);
      let messages = [];
      
      fields.forEach(item => {
        let label = conversionCategoryName(item);
        if (result[item] && config[item] > 0) {
          messages.push({
            key: item,
            displayText: `${label}: ${result[item].length > 0 ? result[item].join('、') : '暂未抽取'}`
          });
        }
      });

      return messages;
    },
    currentMessage() {
      return this.message[this.currentIndex];
    }
  },
  methods: {
    startRotation() {
      this.timer = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.message.length;
      }, 3000);
    },
    stopRotation() {
      clearInterval(this.timer);
    }
  },
  mounted() {
    this.startRotation();
  },
  beforeDestroy() {
    this.stopRotation();
  }
};
</script>

<style lang="scss">
.c-Publicity {
  width: 100%;
  
  .publicity-content {
    .item {
      text-align: center;
      animation: fadeIn 0.3s ease-out;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      
      .value {
        font-size: 20px;
        color: #ffeb3b;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
