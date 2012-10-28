---
comments: true
date: 2011-03-06 21:23:04
layout: post
slug: cleaner-code
title: Cleaner Code
wordpress_id: 26
categories:
- 悟
tags:
- Coding
---

Finished reading Robert Martin's "Clean Code" these days, I suddenly feel more passionate to write code, to write better and more descriptive code.

Before, I do think my coding style is not bad and stick to it every time when I am writing Java, Javascript, SQL, etc.

However, after digesting the essence of "Clean Code", I am forcing myself to write self-descriptive code, without using comment.

The most important points I do remember after reading it are:



	
  1. Longer descriptive name, smaller function

	
  2. Boy Scout Rule

	
  3. Know your algorithm


Although "Clean Code" has shown us many aspects on how to make the code clean, these two rules are easy to remember, fundamental of others.

Now, I feel the passion of writing code as I am writing a diary, an article.  I feel the impulse of cleaning the mess I got before submitting it again.  What is more, in order to make the code cleaner, I have to make my English better.  haha

Just take below function as an example.  You might not easily figure out what it's for.

    
    function groupingFieldFormat(value, p, r, rowIndex, i, ds) {
        var cGrid = ds.cGrid;
        var cGridIsReadonly = (cGrid && cGrid.isReadonly()) ? true : false;
    
        if (rowIndex === 0) {
            if (cGrid.id === 'shipmentPackDetail'
                   && p.id === 'packCount') {
                Core.FieldFormat.addCellEditableIndicator(
                   config, p, cGridIsReadonly);
            }
            return value;
        }
        var lastRecord = ds.getAt(rowIndex - 1);
    
        if (lastRecord.data['lineNo'] == r.data['lineNo']
                &&  lastRecord.data[p.id] === value) {
            return '';
        }
    
        if (cGrid.id === 'shipmentPackDetail'
                && p.id === 'packCount') {
            Core.FieldFormat.addCellEditableIndicator(
                config, p, cGridIsReadonly);
        }
        return value;
    }


Below is the my modified version.  Which version is better is quite obvious although it still has room to improve.

    
    /**
     * Used by Color, Pack Name, Pack Count in two grids
     */
    function eliminateRepeatedValueInGroup(value, colMeta, record, rowIndex, colIndex, dataStore) {
        if (isFirstLineInOneGroup(dataStore, record, rowIndex, colMeta.id)) {
            showPackCountEditableIfNeeded(colMeta, dataStore);
            return value;
        }
    
        // Always show value for the first row in grid
        // even though not the first line in one pack,
        // so that user is easier to check the group value
        return rowIndex === 0 ? value : '';
    }
    
    function isFirstLineInOneGroup(dataStore, record, rowIndex, fieldId) {
        var cGrid = dataStore.cGrid;
        if (cGrid.id === 'shipmentPackDetail') {
            return isFirstLineInOnePack(record);
        }
    
        var lastRecord = dataStore.getAt(rowIndex - 1);
        if (lastRecord
                && lastRecord.data[fieldId] !== record.data[fieldId]) {
            return true;
        }
        return false;
    }
    
    function isFirstLineInOnePack(record) {
        if (record.data['packSeq'] === 1) {
            return true;
        }
        return false;
    }
    
    function showPackCountEditableIfNeeded(colMeta, dataStore) {
        var cGrid = dataStore.cGrid;
        if (cGrid.id === 'shipmentPackDetail'
               && colMeta.id === 'packCount') {
            var cGridIsReadonly =
               (cGrid && cGrid.isReadonly()) ? true : false;
            Core.FieldFormat.addCellEditableIndicator(
                {}, colMeta, cGridIsReadonly);
        }
    }
