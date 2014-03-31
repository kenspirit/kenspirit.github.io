---
comments: true
date: 2011-07-20 15:25:39
layout: post
slug: enhance-performance-of-extjs-grid-record-set-value
title: Enhance Performance of ExtJs Grid Record set value operation
wordpress_id: 54
categories:
- Sword
tags:
- ExtJs
- Javascript
- Performance
---

When implementing a feature for the project, I encounter one Javascript method that takes around 9 seconds to finish.  Clearly, there is some performance issue in it.

The method logic is simple.  Take below table's data as an example:

    Measurement         XS     S     M     L      XL   XXL
     Sleeve             1      1     0     2      2     2

Consider above row "Sleeve" is a Record in ExtJs Grid.  When deleting size S & L column, the figure should change to be:

    Measurement         XS     M     XL      XXL
     Sleeve             2      0      4      4

The intent is to accumulate the figure of the deleted size to the remained ones in one direction from the Standard size M.  Hence, this method requires intensive call on Record.set();  Below is the sudo code.

        var recalculatedGridData = [];
        var colSearchCount = 0;
        for (var rowNo = 0; rowNo < gridStoreLength; rowNo++) {
            ...
            // Calculation logic here to get all the correct data first.
            ...
            recalculatedGridData.push(recordData); // Store the data
        }
        // Reset recalculated data to record
        for (var rowNo = 0; rowNo < recalculatedGridData.length; rowNo++) {
            var recordData = recalculatedGridData[rowNo];
            var record = store.virtualGetAt(recordData.rowNo);
            for (var colNo = 0; colNo < recordData.cells.length; colNo++) {
                var cell = recordData.cells[colNo];
                record.set(cell.name, cell.value);
            }
            // record.batchSet(recordData.cells); // Enhanced version to batch set
        }

The performance tuning rule is first to find out the part where the bigger portion of the time used in.  This method contains two major for loop.  One is the first for calculation logic and the second is just purely setting data to the right cell.

The total time of the method takes around 9 seconds when the involved number of records are 42 and each have 5 cells affected.  It's found that 99% of the time spent on the second for loop.

After testing more intensively, each record.set() takes around 0.05 second.  That is why operation on around 42 * 5 = 210 cells takes 9 seconds.

OK.  Root cause is found and it's time to see why it takes so long to call record.set().  After checking on the source of ExtJs Record and Store object.

In Record.js:

    set : function(name, value){
            var encode = Ext.isPrimitive(value) ? String : Ext.encode;
            if(encode(this.data[name]) == encode(value)) {
                return;
            }
            this.dirty = true;
            if(!this.modified){
                this.modified = {};
            }
            if(this.modified[name] === undefined){
                this.modified[name] = this.data[name];
            }
            this.data[name] = value;
            if(!this.editing){
                this.afterEdit();
            }
        },

        // private
        afterEdit : function(){
            if (this.store != undefined && typeof this.store.afterEdit == "function") {
                this.store.afterEdit(this);
            }
        },

In Store.js:

        afterEdit : function(record){
            if(this.modified.indexOf(record) == -1){
                this.modified.push(record);
            }
            this.fireEvent('update', this, record, Ext.data.Record.EDIT);
        },

You can find that each Record.set() will call store.afterEdit() with its own as parameter.  Hence, I am considering batch update all cells in one record and then trigger Record.afterEdit() method.  Below is the "cracked" method added for batch set data.

    batchSet : function(cells){
            for (var i = cells.length; i--;) {
                var name = cells[i].name;
                var value = cells[i].value;
                var encode = Ext.isPrimitive(value) ? String : Ext.encode;
                if(encode(this.data[name]) == encode(value)) {
                    return;
                }
                this.dirty = true;
                if(!this.modified){
                    this.modified = {};
                }
                if(this.modified[name] === undefined){
                    this.modified[name] = this.data[name];
                }
                this.data[name] = value;
            }
            if(!this.editing){
                this.afterEdit();
            }
        },

After testing, operation based on the same data set takes around 3.5 seconds now.  Suddenly drops 60%!

Kind of satisfied on what I have changed on this.  However, I think there should be room to improve.  Any Comment?
