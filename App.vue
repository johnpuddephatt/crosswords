<template>
  <div class="font-sans h-screen flex flex-col justify-between">
    <div class="flex">
      <div ref="crossword"></div>
      <div class="h-auto flex-1 gap-4 px-2 flex flex-col justify-between">
        <select
          class="mt-2 text-lg p-1 border rounded block w-full"
          v-model="crosswordID"
        >
          <option
            v-for="id in [29504, 29503, 29502, 29501, 29499, 29498, 29497]"
            :value="id"
          >
            Guardian #{{ id }}
            {{ getAnswered(id) }}
          </option>
        </select>

        <div v-if="current" class="text-lg leading-tight">
          <span class="font-bold tracking-tighter w-5">{{
            current.clueLabel
          }}</span>
          <div>
            <span v-html="current.clueText"> </span>
            {{ current.answerLengthText }}
          </div>
        </div>

        <div class="flex flex-col relative" v-if="crosswordController">
          <button
            v-if="current"
            class="block py-2 mt-1 w-auto bg-gray-100 rounded"
            @click="crosswordController.revealCurrentClue()"
          >
            Reveal clue
          </button>
          <button
            v-if="current"
            class="block py-2 mt-1 w-auto bg-gray-100 rounded"
            @click="crosswordController.cleanCurrentClue()"
          >
            Check clue
          </button>

          <button
            class="block py-2 mt-1 max-w-full w-auto bg-gray-100 rounded"
            @click="crosswordController.revealCrossword()"
          >
            Reveal all
          </button>
          <button
            class="block py-2 mt-1 w-auto bg-gray-100 rounded"
            @click="crosswordController.cleanCrossword()"
          >
            Check all
          </button>

          <button
            class="block py-2 mt-1 w-auto bg-gray-100 rounded"
            @click="crosswordController.resetCrossword()"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>

    <div v-if="crosswordModel" class="text-lg pb-4">
      <div
        @click="showClues = 'across'"
        v-if="showClues == 'down'"
        class="columns-2"
      >
        <div
          class="break-inside-avoid leading-tight flex mb-1"
          v-for="clue in crosswordModel.downClues"
        >
          <span class="font-bold text-right tracking-tighter w-6 mr-0.5">{{
            clue.clueLabel
          }}</span>
          <div>
            <span v-html="clue.clueText"> </span> {{ clue.answerLengthText }}
          </div>
        </div>
      </div>

      <div
        @click="showClues = 'down'"
        v-if="showClues == 'across'"
        class="columns-2"
      >
        <div
          class="break-inside-avoid leading-tight flex mb-1"
          v-for="clue in crosswordModel.acrossClues"
        >
          <span class="font-bold text-right tracking-tighter w-6 mr-0.5">{{
            clue.clueLabel
          }}</span>
          <div>
            <span v-html="clue.clueText"> </span> {{ clue.answerLengthText }}
          </div>
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
      showClues: "across",
      current: null,
      crosswordID: null,
      crosswordData: {},
      crosswordModel: null,
      crosswordController: null,
      autosave: null,
    };
  },

  mounted() {
    this.crosswordID = 29504;
  },

  watch: {
    crosswordID() {
      clearInterval(this.autosave);
      var crosswordDataString = localStorage.getItem(this.crosswordID);
      if (crosswordDataString) {
        this.crosswordData = JSON.parse(crosswordDataString);
        this.buildCrossword();
      } else {
        this.fetchAndBuildCrossword();
      }
    },
  },

  methods: {
    log() {
      console.log(this.current);
    },

    getAnswered(id) {
      return JSON.parse(localStorage.getItem(id))?.answered;
    },

    autosaver() {
      let answered = 0;
      if (this.crosswordData?.acrossClues) {
        this.crosswordData.acrossClues.forEach((acrossClue, index) => {
          acrossClue.answer =
            this.crosswordController.crosswordModel.acrossClues[index].answer;
          acrossClue.answer.replace(/ /g, "").length ==
          acrossClue.solution.length
            ? answered++
            : null;
        });

        this.crosswordData.downClues.forEach((downClue, index) => {
          downClue.answer =
            this.crosswordController.crosswordModel.downClues[index].answer;
          downClue.answer.replace(/ /g, "").length == downClue.solution.length
            ? answered++
            : null;
        });

        this.crosswordData.answered =
          Math.floor(
            (answered /
              (this.crosswordData.downClues.length +
                this.crosswordData.acrossClues.length)) *
              100
          ) + "%";

        localStorage.setItem(
          this.crosswordID,
          JSON.stringify(this.crosswordData)
        );
      }
    },

    fetchAndBuildCrossword() {
      var xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-ed3fd66e-24fe-4bd6-acc8-7352117dc861/default/crosswordGrabber.json?id=" +
          this.crosswordID,
        true
      );

      var vue = this;
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          var response = JSON.parse(xhr.responseText);
          vue.crosswordData = vue.transformCrosswordData(response.body);
          vue.buildCrossword();
        }
      };

      xhr.send();
    },

    buildCrossword() {
      this.$refs.crossword.innerHTML = "";
      try {
        console.log(this.crosswordData);
        this.crosswordModel = CrosswordsJS.compileCrossword(this.crosswordData);
      } catch (err) {
        console.log(`Error compiling crossword: ${err}`);
      }
      if (this.crosswordModel) {
        this.crosswordController = new CrosswordsJS.Controller(
          this.crosswordModel,
          this.$refs.crossword
        );
        this.crosswordController.addEventsListener(["clueSelected"], (data) => {
          this.current = data;
        });
        this.autosave = setInterval(() => this.autosaver(), 5000);
      }
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
  },
};
</script>
