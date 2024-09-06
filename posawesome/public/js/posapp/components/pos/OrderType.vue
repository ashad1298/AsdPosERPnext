<template>
  <div>
    <v-autocomplete
      dense
      clearable
      auto-select-first
      outlined
      color="primary"
      :label="frappe._('Order Type')"
      v-model="order_type"
      :items="order_types"
      item-text="name"
      item-value="name"
      background-color="white"
      :no-data-text="__('Order Type not found')"
      hide-details
      :disabled="readonly"
    >
    </v-autocomplete>
    
    <div class="mb-3">
    </div>
  </div>
</template>

<script>
import { eventBus } from '../../bus';
export default {
  data: () => ({
    order_types: ["Dine In", "Drive 2ru", "Take Away"],
    order_type: '',
    readonly: true,
  }),

  components: {
  },

  methods: {
  },

  computed: {},

  created: function () {
    this.$nextTick(function () {
      eventBus.on('set_order_type', (order_type) => {
        console.log(order_type);
        
        this.order_type = order_type;
      });

      eventBus.on('set_order_type_readonly', (value) => {
        this.readonly = value;
      });
    });
  },

  watch: {
    order_type() {
      eventBus.emit('update_order_type', this.order_type);
    },
  },
};
</script>
