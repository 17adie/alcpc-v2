angular.module('alcpcApp').controller('ClientInformationController', ['$rootScope', '$scope', 'settings', 'api', function($rootScope, $scope, settings, api) {
    $scope.$on('$viewContentLoaded', function() {


        let new_client = false

        Ladda.bind('.ladda-button')

        const main = {
            el: {
                tbl: {
                    client_list: '#tbl-client_list',
                },
                btn: {
                    add_client: '#btn-add_client',
                    edit_client: '#btn-edi_client',
                    add_new_client: '[data-target="#modal-add_client_single"]',

                },
                modal: {
                    add_client: '#modal-add_client_single'
                },
                sel: {
                    ass_fsa : '#sel-ass_fsa',
                    biz_style : '#sel-business_style',
                },
                inp: {
                    company_name : '#inp-company_name',
                    company_owner : '#inp-company_owner',
                    streetno_bldg : '#inp-streetno_bldg',
                    towncity : '#inp-towncity',
                    province : '#inp-province',
                    barangay : '#inp-barangay',
                    region : '#inp-region',
                    email_add : '#inp-email_add',
                    mob_no : '#inp-mobile_no',
                    tel_no : '#inp-tel_no',
                    remarks : '#inp-remarks',
                }
            },
            fn: {
                tbl: {

                    // DATATABLES
                    clients: function() {

                        let unfiltered_rows_count;

                        const columns = [
                            {data: "client_id", title: "Client ID", className: 'client_id'},
                            {data: "company_name", title: "Company Name", className: 'company_name'},
                            {data: "company_owner", title: "Client Name", className: 'company_owner'},
                            {data: "towncity", title: "City", className: 'towncity'},
                            {data: "province", title: "Province", className: 'province'},
                            {data: "bussiness_style", title: "Industry", className: 'bussiness_style'},
                            {data: "fsa", title: "Assigned FSA", className: 'fsa'},
                            {data: "c_status", title: "Status", className: 'c_status', orderDataType: "dom-c_status", type: 'string'},
                            {title: "Actions", className: 'td_action', sortable : false}
                        ]

                        $(main.el.tbl.client_list).dataTable({
                            serverSide: true,
                            lengthChange: false,
                            searchDelay: 1000,
                            // ordering: false,
                            // scrollY: 350,
                            processing: true,
                            language: {
                                infoFiltered: "",  // filtered from n total entries datatables remove kasi mali bilang lagi kulang ng isa kapag nag a add.
                            },
                            // ajax: "app/ajax/df4.php",
                            columns: columns,
                            order: [[ 0, "asc" ]],    // ORDER BY 0 = id_num
                            columnDefs: [
                                {
                                    // The `data` parameter refers to the data for the cell (defined by the
                                    // `data` option, which defaults to the column being worked with, in
                                    // this case `data: 0`.
                                    render: function ( data, type, row ) { // wala lang to, para lang wala error. try mo alisin
                                        return row.company_name + ' ' + row.company_owner;
                                    },
                                    targets: -1
                                }
                            ],
                            ajax: function (data, callback, settings) {

                                const params = {
                                    _limit_offset: data.start,
                                    _search_string: data.search.value,
                                    _sort_by: data.columns[data.order[0].column].data,
                                    _sort_direction: data.order[0].dir

                                };

                                // app.view_table.api_request('sp-get_all_client_filterable', params, function (response) {
                                api.view_table.request('sp-get_all_client_filterable', params, function (response) {

                                    let resp = response.data || [];
                                    console.log(resp)

                                    if (data.draw === 1) { // if this is the first draw, which means it is unfiltered
                                        unfiltered_rows_count = response._total_count;
                                    }

                                    let total_count = response._total_count;

                                    callback({

                                        draw: data.draw,
                                        data: resp,
                                        recordsTotal: unfiltered_rows_count,
                                        recordsFiltered: total_count
                                    });
                                });
                            },
                            createdRow: function( row, data, dataIndex ) {

                                $( row ).find('td:eq(-1)')
                                    .html(
                                        '<div style="text-align: left; margin-left: 5px;">' +
                                        '<a data-target="#modal-add_client_single" data-toggle="modal" class="btn btn-sm green btn-view_client tooltips">' +
                                        '<i class="fa fa-eye tooltips" data-placement="bottom" data-original-title="View" title="View"></i>' +
                                        '</a>' +


                                        '<a data-target="#modal-add_client_single" data-toggle="modal" class="btn btn-sm blue btn-edit_client tooltips">' +
                                        '<i class="fa fa-pencil tooltips" data-placement="bottom" data-original-title="Edit" title="Edit"></i>' +
                                        '</a>' +


                                        (data.c_status != 1 ? '<a href="javascript:;" class="btn btn-sm green tooltips btn-activate_client">' +
                                            '<i class="fa fa-check tooltips" data-placement="bottom" data-original-title="Activate" title="Activate" ></i>' +
                                            '<span></span>' +
                                            '</a>' : '<a href="javascript:;" class="btn btn-sm red tooltips btn-deactivate_client">' +
                                            '<i class="fa fa-times tooltips" data-placement="bottom" data-original-title="Deactivate" title="Deactivate"></i>' +
                                            '<span></span>' +
                                            '</a>' +

                                            '</div>')
                                       /* +

                                        '<a class="btn btn-sm btn-outline red tbl-btn-sm-custom tooltips btn-resend_member_alert" data-member_id="'+data.member_id+'" data-member_name="'+(data.last_name + ", " + data.first_name + ", " + data.middle_name  + " " +  data.suffix)+'" data-mob_tel="'+data.mob_tel+'" data-dob="'+data.date_of_birth+'" data-email_add="'+data.email_add+'">' +
                                        '<i class="fa fa-send"></i> Resend Text Alert' +
                                        '</a>'*/
                                    )
                                ;

                                $( row ).find('td:eq(-1) > div > a')
                                    .attr({
                                        'data-client_id': data.client_id,
                                        'data-company_name': data.company_name
                                    });

                                // DISPLAY STATUS WITH TEXT
                                var stat;

                                switch(data.c_status){
                                    case '0':
                                        stat = '<span class="label label-sm label-danger">Inactive</span>';
                                        break;

                                    case '1':
                                        stat = '<span class="label label-sm label-success">Active</span>';
                                        break;

                                    default:
                                        stat = '<span class="label label-sm label-danger">N/A</span>';
                                        break;
                                }

                                $( row ).find('td.c_status')
                                    .html(stat)
                                    .attr({
                                        "data-client_id": data.client_id
                                    });

                                $(row).addClass('hover_cls');

                            }

                        });
                    },
                },
                add: {
                    client: function (cb) {
                        const params = {
                            _company_name: $(main.el.inp.company_name).val(),
                            _company_owner: $(main.el.inp.company_owner).val(),
                            _streetno_bldg: $(main.el.inp.streetno_bldg).val(),
                            _towncity: $(main.el.inp.towncity).val(),
                            _province: $(main.el.inp.province).val(),
                            _barangay: $(main.el.inp.barangay).val(),
                            // _region: $(main.el.inp.region).val(),
                            _email_add: $(main.el.inp.email_add).val(),
                            _mob_no: $(main.el.inp.mob_no).val(),
                            _tel_no: $(main.el.inp.tel_no).val(),
                            _ass_fsa: $(main.el.sel.ass_fsa).val(),
                            _biz_style: $(main.el.sel.biz_style).val(),
                            _remarks: $(main.el.inp.remarks).val(),
                            _added_by: 'test'

                        };
                        console.log(params)
                        api.crud.request('sp-add_client', params, function (resp) {
                            return cb(resp)
                        })
                    }
                },
                update: {
                    client: function (client_id, cb) {
                        const params = {
                            _client_id: client_id,
                            _company_name: $(main.el.inp.company_name).val(),
                            _company_owner: $(main.el.inp.company_owner).val(),
                            _streetno_bldg: $(main.el.inp.streetno_bldg).val(),
                            _towncity: $(main.el.inp.towncity).val(),
                            _province: $(main.el.inp.province).val(),
                            _barangay: $(main.el.inp.barangay).val(),
                            _email_add: $(main.el.inp.email_add).val(),
                            _mob_no: $(main.el.inp.mob_no).val(),
                            _tel_no: $(main.el.inp.tel_no).val(),
                            _ass_fsa: $(main.el.sel.ass_fsa).val(),
                            _biz_style: $(main.el.sel.biz_style).val(),
                            _remarks: $(main.el.inp.remarks).val(),
                            _update_by: 'test update'

                        };
                        api.crud.request('sp-update_client', params, function (resp) {
                            return cb(resp)
                        })
                    },
                    status: function (client_id, stat, cb) {
                        const params = {
                            _client_id: client_id,
                            _status: stat,
                            _user_id: 17

                        };
                        api.crud.request('sp-update_client_status', params, function (resp) {
                            return cb(resp)
                        })
                    }
                },
                get: {
                    client: function (client_id, cb) {
                        const params = {
                            _client_id: client_id,
                        };
                        api.crud.request('sp-get_client_details', params, function (resp) {
                            let d = resp[0]

                            $(main.el.inp.company_name).val(d.company_name)
                            $(main.el.inp.company_owner).val(d.company_owner)
                            $(main.el.inp.streetno_bldg).val(d.streetno_bldg)
                            $(main.el.inp.towncity).val(d.towncity)
                            $(main.el.inp.province).val(d.province)
                            $(main.el.inp.barangay).val(d.barangay)
                            $(main.el.inp.email_add).val(d.email_add)
                            $(main.el.inp.mob_no).val(d.mob_no)
                            $(main.el.inp.tel_no).val(d.tel_no)
                            $(main.el.inp.remarks).val(d.remarks)

                            $(main.el.sel.ass_fsa).val(d.ass_fsa).trigger('change')
                            $(main.el.sel.biz_style).val(d.biz_style).trigger('change')

                            return cb(resp)
                        });
                    },
                    fsa_list: function (cb) {

                        var fsa_list = []
                        api.get_list.request('sp-get_fsa_list', function (resp) {

                            $(main.el.sel.ass_fsa).append('<option></option>');
                            $.each(resp, function (index, item) {
                                // fsa_list.push(item.first_name + ' ' +  item.last_name)
                                fsa_list.push({
                                    id: item.tbl_id,
                                    text: item.first_name + ' ' +  item.last_name
                                })
                            })

                            $.fn.select2.defaults.set("theme", "bootstrap");
                            $(main.el.sel.ass_fsa).select2({
                                data: fsa_list,
                                placeholder: "Select FSA",
                                width: 'auto',
                                allowClear: true,
                                dropdownParent: $(main.el.modal.add_client) //for search input ( tabindex="-1" ) at modal

                            })
                            return cb()
                        });
                    },
                    biz_style_list: function (cb) {

                        var biz_list = []
                        api.get_list.request('sp-get_business_style_list', function (resp) {

                            $(main.el.sel.biz_style).append('<option></option>');
                            $.each(resp, function (index, item) {
                                biz_list.push({
                                    id: item.tbl_id,
                                   text: item.bussiness_style
                                })
                            })

                            $.fn.select2.defaults.set("theme", "bootstrap");
                            $(main.el.sel.biz_style).select2({
                                data: biz_list,
                                placeholder: "Select Business Style",
                                width: 'auto',
                                allowClear: true,
                                dropdownParent: $(main.el.modal.add_client) //for search input ( tabindex="-1" ) at modal

                            })
                            return cb()
                        });
                    }
                }
            }
        }


        // Initialize datatable
        main.fn.tbl.clients()


        // BUTTONS
        $(main.el.btn.add_new_client).off('click').on('click', function(){
            new_client = true
            console.log('OPEN MODAL')
            $rootScope.loader('show', '#modal-add_client_single .modal-body');
            main.fn.get.fsa_list(  function () {
                main.fn.get.biz_style_list( function () {
                    $('.client-modal').text('Single Client Enrollment')
                    $(main.el.btn.add_client).text('Save')
                    $rootScope.loader('hide', '#modal-add_client_single .modal-body');
                })

            })
        })

        $(document)

        .off('click', '.btn-activate_client').on('click', '.btn-activate_client', function () {
            app.client_id = $(this).data().client_id
            app.company_name = $(this).data().company_name
            console.log(`activate client ID : ${app.company_name}`)
            swal({
                title: 'Activate Client' ,
                text: 'Are you sure you want to deactivate ' + app.company_name + ' ?',
                // type: "",
                showCancelButton: true,
                closeOnConfirm: false,
                confirmButtonText: "Yes",
                // showLoaderOnConfirm: true
            }, function () {
                main.fn.update.status(app.client_id, 1, function (resp) {
                    swal('Activated successful!','','success');
                    $(main.el.tbl.client_list).DataTable().draw(false) // refresh with false = to retain page when draw
                })
            });


        })

        .off('click', '.btn-deactivate_client').on('click', '.btn-deactivate_client', function () {
            app.client_id = $(this).data().client_id
            app.company_name = $(this).data().company_name
            console.log(`deactivate client ID : ${app.client_id}`)
            swal({
                title: 'Deactivate Client' ,
                text: 'Are you sure you want to deactivate ' + app.company_name + ' ?',
                // type: "",
                showCancelButton: true,
                closeOnConfirm: false,
                confirmButtonText: "Yes",
                // showLoaderOnConfirm: true
            }, function () {
                main.fn.update.status(app.client_id, 0, function (resp) {
                    swal('Deactivated successful!','','success');
                    $(main.el.tbl.client_list).DataTable().draw(false);
                })
            });

        })



        .off('click', '.btn-edit_client').on('click', '.btn-edit_client', function () {
            new_client = false
            app.client_id = $(this).data().client_id
            $rootScope.loader('show', '#modal-add_client_single .modal-body');
            main.fn.get.fsa_list(  function () {
                main.fn.get.biz_style_list( function () {
                    main.fn.get.client(app.client_id, function (resp) {
                        $('.client-modal').text('Update Client Information')
                        $(main.el.btn.add_client).text('Update')
                        $rootScope.loader('hide', '#modal-add_client_single .modal-body');
                    })

                })

            })
        })

        .off('click', main.el.btn.add_client).on('click', main.el.btn.add_client, function () {
            // validate required data
            if(app.validate_input(main.el.modal.add_client)){

                if(new_client){
                    main.fn.add.client( function (resp) {
                        resp = resp.length > 0 ? resp[0] : ''

                        const
                            is_duplicate_client = resp.is_duplicate_client

                        if(is_duplicate_client){
                            swal('Duplicate client','Client already exists\n' + 'Client ID: ' + is_duplicate_client , 'error')
                            Ladda.stopAll()
                        }else{
                            $(main.el.modal.add_client).modal('hide')
                            swal('Client Registration','New client successfully registered','success')
                            Ladda.stopAll()
                            $(main.el.tbl.client_list).DataTable().draw() // refresh member table after add
                        }

                    })
                } else {
                    // UPDATE
                    main.fn.update.client(app.client_id, function (resp) {
                        resp = resp.length > 0 ? resp[0] : ''
                        console.log(resp)
                        const
                            is_duplicate_client = resp.is_duplicate_client
                        if(is_duplicate_client){
                            swal('Duplicate client','Client already exists\n' + 'Client ID: ' + is_duplicate_client , 'error')
                            Ladda.stopAll()
                        }else{
                            $(main.el.modal.add_client).modal('hide')
                            swal('Update Successful','Client has been successfully updated','success')
                            Ladda.stopAll()
                            $(main.el.tbl.client_list).DataTable().draw(false) // refresh member table after add
                        }

                    })
                }
            }else{
                swal('Incomplete Details','Please complete all the required info marked with (*)','warning')
                Ladda.stopAll()
            }

        })


        // reset all
        $(main.el.modal.add_client).on('hidden.bs.modal', function (e) {
            $(this)
                .find("input,textarea,select")
                .val('')
                .end()
                .find("input[type=checkbox], input[type=radio]")
                .prop("checked", "")
                .end();
        })


    });
}]);