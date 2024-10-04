<template>
  <div>
    <select v-model="crosswordID">
      <option v-for="id in [29504, 29503, 29502, 29501, 29500]" :value="id">
        Crossword #{{ id }}
      </option>
    </select>
    {{ crosswordID }}
    {{ cat }}
    <div ref="crossword"></div>

    <div v-if="crosswordModel" class="grid grid-cols-2">
      <div>
        <div v-for="clue in crosswordModel.downClues">
          {{ clue.clueLabel }} {{ clue.clueText }} {{ clue.answerLengthText }}
        </div>
      </div>
      <hr />
      <div>
        <div v-for="clue in crosswordModel.acrossClues">
          {{ clue.clueLabel }} {{ clue.clueText }} {{ clue.answerLengthText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "./libraries/crosswords-js/dist/crosswords.css";
import { CrosswordsJS } from "./libraries/crosswords-js/src/index.mjs";

export default {
  data() {
    return {
      crosswordID: 29504,
      crosswordData: null,
      crosswordModel: null,
      crosswordController: null,
      cat: "NaC",
    };
  },

  mounted() {
    console.log(this.$refs.crossword);
    this.fetchAndBuildCrossword(this.crosswordID);

    // document.cookie =
    //   this.crosswordID +
    //   "=John Doe" +
    //   "; expires=Jan, 01 Dec 2999 12:00:00 UTC";

    // this.cat = this.getCookie(this.crosswordID);
  },

  watch: {
    crosswordID() {
      console.log("trying: " + this.crosswordID);
      this.fetchAndBuildCrossword(this.crosswordID);
    },
  },

  methods: {
    fetchAndBuildCrossword(id) {
      fetch("./guardian-demo.json")
        .then((response) => response.json())
        .then((response) => console.log(response));

      var xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-ed3fd66e-24fe-4bd6-acc8-7352117dc861/default/crosswordGrabber.json?id=" +
          id,
        true
      );

      var vue = this;

      xhr.onreadystatechange = function () {
        console.log("onreadystatechange ");

        if (xhr.readyState == 4 && xhr.status == 200) {
          var response = JSON.parse(xhr.responseText);
          vue.crosswordData = vue.transformCrosswordData(response.body);

          console.log(vue.crosswordData);
          vue.buildCrossword();
        }
      };

      xhr.send();
    },
    buildCrossword() {
      this.$refs.crossword.innerHTML = "";
      try {
        this.crosswordModel = CrosswordsJS.compileCrossword(this.crosswordData);
      } catch (err) {
        console.log(`Error compiling crossword: ${err}`);
      }

      this.crosswordController = new CrosswordsJS.Controller(
        this.crosswordModel,
        this.$refs.crossword
      );
    },

    transformCrosswordData(original) {
      const info = {
        source: original.creator.webUrl,
        title: original.name,
        setter: {
          title: original.creator.name,
          url: original.creator.webUrl,
        },
      };

      const width = original.dimensions.cols;
      const height = original.dimensions.rows;

      var acrossClues = [];
      var downClues = [];

      for (var i = 0; i < original.entries.length; i++) {
        var entry = original.entries[i];

        if (entry.direction === "across") {
          acrossClues.push({
            x: entry.position.x + 1, // Convert to 1-based indexing
            y: entry.position.y + 1, // Convert to 1-based indexing
            clue: entry.humanNumber + ". " + entry.clue,
            solution: entry.solution,
          });
        }

        if (entry.direction === "down") {
          downClues.push({
            x: entry.position.x + 1, // Convert to 1-based indexing
            y: entry.position.y + 1, // Convert to 1-based indexing
            clue: entry.humanNumber + ". " + entry.clue,
            solution: entry.solution,
          });
        }
      }

      return {
        info,
        width,
        height,
        acrossClues,
        downClues,
      };
    },

    getCookie(cname) {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
  },
};
</script>
